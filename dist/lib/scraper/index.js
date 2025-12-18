"use server";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAmazonProduct = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("../utils");
async function scrapeAmazonProduct(url) {
    if (!url)
        return;
    console.log('🔍 Starting scrape for:', url);
    // BrightData proxy configuration
    const username = String(process.env.BRIGHT_DATA_USERNAME);
    const password = String(process.env.BRIGHT_DATA_PASSWORD);
    const port = 22225;
    const session_id = (1000000 * Math.random()) | 0;
    console.log('🔐 BrightData credentials configured:', username ? 'Yes' : 'No');
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    };
    try {
        // Fetch the product page
        console.log('📡 Fetching page via BrightData proxy...');
        const response = await axios_1.default.get(url, options);
        const $ = cheerio.load(response.data);
        // Extract the product title
        const title = $('#productTitle').text().trim();
        const currentPrice = (0, utils_1.extractPrice)($('.priceToPay span.a-price-whole'), $('.a.size.base.a-color-price'), $('.a-button-selected .a-color-base'));
        const originalPrice = (0, utils_1.extractPrice)($('#priceblock_ourprice'), $('.a-price.a-text-price span.a-offscreen'), $('#listPrice'), $('#priceblock_dealprice'), $('.a-size-base.a-color-price'));
        const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
        const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
            $('#landingImage').attr('data-a-dynamic-image') ||
            '{}';
        const imageUrls = Object.keys(JSON.parse(images));
        const currency = (0, utils_1.extractCurrency)($('.a-price-symbol'));
        const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
        const description = (0, utils_1.extractDescription)($);
        // Construct data object with scraped information
        const data = {
            url,
            currency: currency || '$',
            image: imageUrls[0],
            title,
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discountRate: Number(discountRate),
            category: 'category',
            reviewsCount: 100,
            stars: 4.5,
            isOutOfStock: outOfStock,
            createdAt: new Date(),
            description,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
            productType: 'scraped', // Mark as scraped product type
        };
        console.log('✅ Scraped product:', title);
        console.log('💰 Price:', data.currentPrice, data.currency);
        return data;
    }
    catch (error) {
        console.error('❌ Scraper error:', error.message);
        console.error('Stack:', error.stack);
    }
}
exports.scrapeAmazonProduct = scrapeAmazonProduct;
