import { NextResponse } from "next/server";
import { getLowestPrice, getHighestPrice, getAveragePrice } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { PriceHistoryItem } from "@/types";

export const maxDuration = 59;
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectToDB();

    const products = await Product.find({});

    if (!products || products.length === 0) throw new Error("No products found");

    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

        if (!scrapedProduct) return null;

        const updatedPriceHistory: PriceHistoryItem[] = [
          ...currentProduct.priceHistory,
          { price: scrapedProduct.currentPrice, date: new Date() },
        ];

        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        return Product.findOneAndUpdate(
          { url: product.url },
          product,
          { new: true, upsert: true }
        );
      })
    );

    return NextResponse.json({ message: "Ok", data: updatedProducts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: `Failed: ${message}`, error: true });
  }
}
