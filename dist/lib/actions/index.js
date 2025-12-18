"use server";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserEmailToProduct = exports.getSimilarProducts = exports.getAllProducts = exports.getProductById = exports.scrapeAndStoreProduct = void 0;
const cache_1 = require("next/cache");
const product_model_1 = __importDefault(require("../models/product.model"));
const mongoose_1 = require("../mongoose");
const scraper_1 = require("../scraper");
const utils_1 = require("../utils");
const nodemailer_1 = require("../nodemailer");
async function scrapeAndStoreProduct(productUrl) {
    if (!productUrl)
        return;
    try {
        await (0, mongoose_1.connectToDB)();
        const scrapedProduct = await (0, scraper_1.scrapeAmazonProduct)(productUrl);
        if (!scrapedProduct) {
            console.log('⚠️ Scraper returned no data');
            return;
        }
        console.log('📦 Scraped product received, processing...');
        let product = Object.assign(Object.assign({}, scrapedProduct), { createdAt: new Date(), priceHistory: [{
                    price: scrapedProduct.currentPrice,
                    date: new Date()
                }] });
        const existingProduct = await product_model_1.default.findOne({ url: scrapedProduct.url });
        if (existingProduct) {
            const updatedPriceHistory = [
                ...existingProduct.priceHistory,
                { price: scrapedProduct.currentPrice,
                    originalPrice: scrapedProduct.originalPrice
                }
            ];
            product = Object.assign(Object.assign({}, scrapedProduct), { priceHistory: updatedPriceHistory, lowestPrice: (0, utils_1.getLowestPrice)(updatedPriceHistory), highestPrice: (0, utils_1.getHighestPrice)(updatedPriceHistory), averagePrice: (0, utils_1.getAveragePrice)(updatedPriceHistory), createdAt: new Date() });
        }
        const newProduct = await product_model_1.default.findOneAndUpdate({ url: scrapedProduct.url }, product, { upsert: true, new: true });
        console.log('💾 Product saved to MongoDB:', newProduct._id);
        console.log('📊 Product details:', {
            title: newProduct.title,
            price: newProduct.currentPrice,
            productType: newProduct.productType
        });
        // Only revalidate if running in Next.js context (not from bot script)
        try {
            await (0, cache_1.revalidatePath)(`/products/${newProduct._id}`);
        }
        catch (revalidateError) {
            // Ignore revalidation errors when running outside Next.js (e.g., from bot)
            console.log('⚠️ Skipping revalidatePath (not in Next.js context)');
        }
    }
    catch (error) {
        console.error('❌ Error in scrapeAndStoreProduct:', error.message);
        throw new Error(`Failed to create/update product: ${error.message}`);
    }
}
exports.scrapeAndStoreProduct = scrapeAndStoreProduct;
async function getProductById(productId) {
    try {
        await (0, mongoose_1.connectToDB)();
        const product = await product_model_1.default.findOne({ _id: productId });
        if (!product)
            return null;
        return product;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getProductById = getProductById;
async function getAllProducts() {
    try {
        await (0, mongoose_1.connectToDB)();
        const products = await product_model_1.default.find();
        return products;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getAllProducts = getAllProducts;
async function getSimilarProducts(productId) {
    try {
        await (0, mongoose_1.connectToDB)();
        const currentProduct = await product_model_1.default.findById(productId);
        if (!currentProduct)
            return null;
        const similarProducts = await product_model_1.default.find({
            _id: { $ne: productId },
        }).limit(10);
        return similarProducts;
    }
    catch (error) {
        console.log(error);
    }
}
exports.getSimilarProducts = getSimilarProducts;
async function addUserEmailToProduct(productId, userEmail) {
    try {
        const product = await product_model_1.default.findById(productId);
        if (!product)
            return;
        const userExists = product.users.some((user) => user.email === userEmail);
        if (!userExists) {
            product.users.push({ email: userEmail });
            await product.save();
            const emailContent = await (0, nodemailer_1.generateEmailBody)(product, "WELCOME");
            await (0, nodemailer_1.sendEmail)(emailContent, [userEmail]);
        }
    }
    catch (error) {
        console.log(error);
    }
}
exports.addUserEmailToProduct = addUserEmailToProduct;
