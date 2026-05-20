"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeProduct } from "../scraper-client";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { Product as ProductType, PriceHistoryItem } from "@/types";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectToDB();

    const scrapedProduct = await scrapeProduct(productUrl);

    if (!scrapedProduct) return;

    let product = {
      ...scrapedProduct,
      priceHistory: [{
        price: scrapedProduct.currentPrice,
        date: new Date()
      }],
    };

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: PriceHistoryItem[] = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice, date: new Date() }
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    try {
      await revalidatePath(`/products/${newProduct._id}`);
    } catch {
      // not in Next.js context (e.g. bot script)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create/update product: ${message}`);
  }
}

export async function getProductById(productId: string): Promise<ProductType | null | undefined> {
  try {
    await connectToDB();

    const product = await Product.findOne({ _id: productId }).lean();

    if (!product) return null;

    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error(error);
  }
}

export async function getAllProducts(): Promise<ProductType[] | undefined> {
  try {
    await connectToDB();

    const products = await Product.find().lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error(error);
  }
}

export async function getSimilarProducts(productId: string): Promise<ProductType[] | null | undefined> {
  try {
    await connectToDB();

    const currentProduct = await Product.findById(productId).lean();

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(10).lean();

    return JSON.parse(JSON.stringify(similarProducts));
  } catch (error) {
    console.error(error);
  }
}
