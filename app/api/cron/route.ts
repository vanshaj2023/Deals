import { NextResponse } from 'next/server';
import { getLowestPrice, getHighestPrice, getAveragePrice } from '@/lib/utils';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.model';
import { scrapeProduct } from '@/lib/scraper-client';
import { dispatchAlertsForProduct } from '@/lib/alerts/dispatch';
import { PriceHistoryItem } from '@/types';

export const maxDuration = 59;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDB();

    const products = await Product.find({});

    if (!products.length) throw new Error('No products found');

    const results = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeProduct(currentProduct.url);
        if (!scrapedProduct) return null;

        const previousPrice: number = currentProduct.currentPrice;

        const updatedPriceHistory: PriceHistoryItem[] = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice, date: new Date() },
        ];

        const updated = await Product.findOneAndUpdate(
          { url: scrapedProduct.url },
          {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          },
          { new: true, upsert: true }
        );

        if (updated) {
          await dispatchAlertsForProduct(
            JSON.parse(JSON.stringify(updated)),
            previousPrice
          );
        }

        return updated;
      })
    );

    return NextResponse.json({ message: 'Ok', data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: `Failed: ${message}`, error: true });
  }
}
