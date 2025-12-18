"use server";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserEmailToDeal = exports.getSimilarDeals = exports.getAllDeals = exports.getDealById = exports.scrapeAndStoreDeal = void 0;
const cache_1 = require("next/cache");
const product_model_1 = __importDefault(require("../models/product.model")); // Using the Product model
const mongoose_1 = require("../mongoose");
const scraper_1 = require("../scraper");
const utils_1 = require("../utils");
const nodemailer_1 = require("../nodemailer");
async function scrapeAndStoreDeal(dealUrl) {
    if (!dealUrl)
        return;
    try {
        (0, mongoose_1.connectToDB)();
        const scrapedDeal = await (0, scraper_1.scrapeAmazonProduct)(dealUrl);
        if (!scrapedDeal)
            return;
        let deal = scrapedDeal;
        const existingDeal = await product_model_1.default.findOne({ url: scrapedDeal.url });
        if (existingDeal) {
            const updatedPriceHistory = [
                ...existingDeal.priceHistory,
                { price: scrapedDeal.currentPrice, date: new Date() }
            ];
            deal = Object.assign(Object.assign({}, scrapedDeal), { priceHistory: updatedPriceHistory, lowestPrice: (0, utils_1.getLowestPrice)(updatedPriceHistory), highestPrice: (0, utils_1.getHighestPrice)(updatedPriceHistory), averagePrice: (0, utils_1.getAveragePrice)(updatedPriceHistory) });
        }
        const newDeal = await product_model_1.default.findOneAndUpdate({ url: scrapedDeal.url }, deal, { upsert: true, new: true });
        (0, cache_1.revalidatePath)(`/deals/${newDeal._id}`);
    }
    catch (error) {
        throw new Error(`Failed to create/update deal: ${error.message}`);
    }
}
exports.scrapeAndStoreDeal = scrapeAndStoreDeal;
async function getDealById(dealId) {
    try {
        (0, mongoose_1.connectToDB)();
        const deal = await product_model_1.default.findOne({ _id: dealId });
        if (!deal)
            return null;
        return deal;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getDealById = getDealById;
async function getAllDeals() {
    try {
        (0, mongoose_1.connectToDB)();
        const deals = await product_model_1.default.find({ discountRate: { $gt: 0 } }); // Deals have a discount rate greater than 0
        return deals;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getAllDeals = getAllDeals;
async function getSimilarDeals(dealId) {
    try {
        (0, mongoose_1.connectToDB)();
        const currentDeal = await product_model_1.default.findById(dealId);
        if (!currentDeal)
            return null;
        const similarDeals = await product_model_1.default.find({
            _id: { $ne: dealId },
            category: currentDeal.category,
        }).limit(10);
        return similarDeals;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getSimilarDeals = getSimilarDeals;
async function addUserEmailToDeal(dealId, userEmail) {
    try {
        const deal = await product_model_1.default.findById(dealId);
        if (!deal)
            return;
        const userExists = deal.users.some((user) => user.email === userEmail);
        if (!userExists) {
            deal.users.push({ email: userEmail });
            await deal.save();
            const emailContent = await (0, nodemailer_1.generateEmailBody)(deal, "WELCOME");
            await (0, nodemailer_1.sendEmail)(emailContent, [userEmail]);
        }
    }
    catch (error) {
        console.log(error);
    }
}
exports.addUserEmailToDeal = addUserEmailToDeal;
