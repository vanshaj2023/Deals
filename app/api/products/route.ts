import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDB } from '@/lib/mongoose';
import Product from '@/lib/models/product.model';
import TrackedProduct from '@/lib/models/tracked-product.model';
import User from '@/lib/models/user.model';
import { scrapeAmazonProduct } from '@/lib/scraper';
import { getLowestPrice, getHighestPrice, getAveragePrice } from '@/lib/utils';
import { PriceHistoryItem } from '@/types';
import { sendEmailAlert } from '@/lib/alerts/email';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDB();

    const trackings = await TrackedProduct.find({ userId: session.user.id })
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean();

    const data = trackings.map((t) => ({
      _id: t._id,
      targetPrice: t.targetPrice,
      thresholdPercent: t.thresholdPercent,
      paused: t.paused,
      channelOverride: t.channelOverride,
      createdAt: t.createdAt,
      product: t.productId,
    }));

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url, targetPrice, thresholdPercent } = await req.json() as {
    url: string;
    targetPrice?: number;
    thresholdPercent?: number;
  };

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  try {
    await connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(url);
    if (!scrapedProduct) {
      return NextResponse.json({ error: 'Failed to scrape product' }, { status: 502 });
    }

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });
    let product;

    if (existingProduct) {
      const updatedPriceHistory: PriceHistoryItem[] = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice, date: new Date() },
      ];
      product = await Product.findOneAndUpdate(
        { url: scrapedProduct.url },
        {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        },
        { new: true }
      );
    } else {
      product = await Product.create({
        ...scrapedProduct,
        priceHistory: [{ price: scrapedProduct.currentPrice, date: new Date() }],
      });
    }

    const resolvedTargetPrice = targetPrice ?? Math.round(scrapedProduct.currentPrice * 0.9);

    const tracking = await TrackedProduct.findOneAndUpdate(
      { userId: session.user.id, productId: product._id },
      {
        userId: session.user.id,
        productId: product._id,
        targetPrice: resolvedTargetPrice,
        thresholdPercent: thresholdPercent ?? null,
        paused: false,
      },
      { upsert: true, new: true }
    );

    const user = await User.findById(session.user.id).lean() as { email: string } | null;
    if (user) {
      await sendEmailAlert(user.email, { title: product.title, url: product.url }, 'WELCOME');
    }

    return NextResponse.json({ data: { tracking, product } }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
