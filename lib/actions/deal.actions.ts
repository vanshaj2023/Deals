"use server";

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User, PriceHistoryItem } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";

export async function scrapeAndStoreDeal(dealUrl: string) {
  if (!dealUrl) return;

  try {
    await connectToDB();

    const scrapedDeal = await scrapeAmazonProduct(dealUrl);

    if (!scrapedDeal) return;

    let deal = { ...scrapedDeal, priceHistory: [] as PriceHistoryItem[] };

    const existingDeal = await Product.findOne({ url: scrapedDeal.url });

    if (existingDeal) {
      const updatedPriceHistory: PriceHistoryItem[] = [
        ...existingDeal.priceHistory,
        { price: scrapedDeal.currentPrice, date: new Date() }
      ];

      deal = {
        ...scrapedDeal,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newDeal = await Product.findOneAndUpdate(
      { url: scrapedDeal.url },
      deal,
      { upsert: true, new: true }
    );

    revalidatePath(`/deals/${newDeal._id}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create/update deal: ${message}`);
  }
}

export async function getDealById(dealId: string) {
  try {
    await connectToDB();

    const deal = await Product.findOne({ _id: dealId });

    if (!deal) return null;

    return deal;
  } catch (error) {
    console.error(error);
  }
}

export async function getAllDeals() {
  try {
    await connectToDB();

    const deals = await Product.find({ discountRate: { $gt: 0 } });

    return deals;
  } catch (error) {
    console.error(error);
  }
}

export async function getSimilarDeals(dealId: string) {
  try {
    await connectToDB();

    const currentDeal = await Product.findById(dealId);

    if (!currentDeal) return null;

    const similarDeals = await Product.find({
      _id: { $ne: dealId },
      category: currentDeal.category,
    }).limit(10);

    return similarDeals;
  } catch (error) {
    console.error(error);
  }
}

export async function addUserEmailToDeal(dealId: string, userEmail: string) {
  try {
    const deal = await Product.findById(dealId);

    if (!deal) return;

    const userExists = deal.users.some((user: User) => user.email === userEmail);

    if (!userExists) {
      deal.users.push({ email: userEmail });

      await deal.save();

      const emailContent = await generateEmailBody(deal, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.error(error);
  }
}
