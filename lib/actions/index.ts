"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) return;

  try {
    await connectToDB();

    const scrapedProduct = await scrapeAmazonProduct(productUrl);

    if (!scrapedProduct) {
      console.log('⚠️ Scraper returned no data');
      return;
    }
    
    console.log('📦 Scraped product received, processing...');

    let product = {
      ...scrapedProduct, createdAt: new Date(), // Set createdAt field here 
      priceHistory: [{
        price: scrapedProduct.currentPrice,
        date: new Date()
      }], // Initialize priceHistory 
    };

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice,
          originalPrice: scrapedProduct.originalPrice
         }
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
        createdAt: new Date()
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    console.log('💾 Product saved to MongoDB:', newProduct._id);
    console.log('📊 Product details:', {
      title: newProduct.title,
      price: newProduct.currentPrice,
      productType: newProduct.productType
    });

    // Only revalidate if running in Next.js context (not from bot script)
    try {
      await revalidatePath(`/products/${newProduct._id}`);
    } catch (revalidateError) {
      // Ignore revalidation errors when running outside Next.js (e.g., from bot)
      console.log('⚠️ Skipping revalidatePath (not in Next.js context)');
    }
  } catch (error: any) {
    console.error('❌ Error in scrapeAndStoreProduct:', error.message);
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    await connectToDB();

    const product = await Product.findOne({ _id: productId }).lean();

    if (!product) return null;

    // Convert to plain object and stringify ObjectId
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    await connectToDB();

    const products = await Product.find().lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.log(error);
  }
}

export async function getSimilarProducts(productId: string) {
  try {
    await connectToDB();

    const currentProduct = await Product.findById(productId).lean();

    if (!currentProduct) return null;

    const similarProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(10).lean();

    return JSON.parse(JSON.stringify(similarProducts));
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if (!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}
