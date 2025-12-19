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
// AI-powered extraction using OpenAI - sends complete HTML
async function extractWithAI(html, url) {
    var _a, _b;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log('🔑 OpenAI API Key check:', openaiApiKey ? `Present (${openaiApiKey.substring(0, 10)}...)` : 'NOT FOUND');
    if (!openaiApiKey || openaiApiKey.trim() === '') {
        console.log('⚠️ OpenAI API key not found or empty, using traditional scraping');
        return null;
    }
    try {
        console.log('🤖 Sending complete HTML to OpenAI for intelligent extraction...');
        console.log('📏 HTML length:', html.length, 'characters');
        // Trim HTML to stay within token limits (keep first 100k chars which is ~25k tokens)
        const trimmedHtml = html.substring(0, 100000);
        const response = await axios_1.default.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert at extracting product information from Amazon product pages HTML. 
Analyze the complete HTML and extract the following information. Return ONLY a valid JSON object with these exact fields:
{
  "title": "product title",
  "currentPrice": number (just the number, no currency symbol),
  "originalPrice": number (original/list price if available, or same as current price),
  "currency": "currency symbol like $ or ₹",
  "stars": number (rating out of 5, like 4.5),
  "reviewsCount": number (total number of reviews),
  "category": "main product category",
  "description": "Clean, readable product description with key features as bullet points. Remove all HTML tags, special characters, JavaScript code, and formatting. Keep only the actual product features and benefits in plain text. Format as: Feature 1. Feature 2. Feature 3. etc.",
  "isOutOfStock": boolean (true if out of stock),
  "discountRate": number (discount percentage without % symbol)
}

CRITICAL for description field:
- Extract ONLY the actual product features, specifications, and benefits
- Remove ALL HTML tags like <div>, <img>, <script>, etc.
- Remove JavaScript code, CSS, and special characters
- Remove duplicate or repetitive text
- Format as clean bullet points or sentences
- Keep it concise (max 300-400 words)
- Focus on what the product DOES and its KEY FEATURES

Return ONLY the JSON object, no markdown formatting, no other text.`
                },
                {
                    role: 'user',
                    content: `Extract product information from this Amazon product page HTML:\n\n${trimmedHtml}`
                }
            ],
            temperature: 0.1,
            max_tokens: 1500,
        }, {
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const content = response.data.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const extractedData = JSON.parse(jsonContent);
        console.log('✅ AI extraction successful');
        console.log('📝 AI Description:', ((_a = extractedData.description) === null || _a === void 0 ? void 0 : _a.substring(0, 200)) + '...');
        return extractedData;
    }
    catch (error) {
        console.error('❌ AI extraction failed:', error.message);
        if ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) {
            console.error('API Error:', error.response.data);
        }
        return null;
    }
}
async function scrapeAmazonProduct(url) {
    var _a, _b;
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
        const html = response.data;
        const $ = cheerio.load(html);
        // Try AI extraction first
        const aiData = await extractWithAI(html, url);
        if (aiData) {
            // Get image from traditional scraping (more reliable)
            const images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
                $('#landingImage').attr('data-a-dynamic-image') ||
                '{}';
            const imageUrls = Object.keys(JSON.parse(images));
            const data = {
                url,
                currency: aiData.currency || '$',
                image: imageUrls[0],
                title: aiData.title,
                currentPrice: Number(aiData.currentPrice) || 0,
                originalPrice: Number(aiData.originalPrice) || Number(aiData.currentPrice) || 0,
                priceHistory: [],
                discountRate: Number(aiData.discountRate) || 0,
                category: aiData.category || 'General',
                reviewsCount: Number(aiData.reviewsCount) || 0,
                stars: Number(aiData.stars) || 0,
                isOutOfStock: Boolean(aiData.isOutOfStock),
                createdAt: new Date(),
                description: aiData.description || '',
                lowestPrice: Number(aiData.currentPrice) || 0,
                highestPrice: Number(aiData.originalPrice) || Number(aiData.currentPrice) || 0,
                averagePrice: Number(aiData.currentPrice) || 0,
                productType: 'scraped',
            };
            console.log('✅ Product scraped via AI:', data.title);
            console.log('💰 Price:', data.currentPrice, data.currency);
            console.log('⭐ Rating:', data.stars, '| Reviews:', data.reviewsCount);
            console.log('📦 Category:', data.category);
            console.log('📝 Description saved:', ((_a = data.description) === null || _a === void 0 ? void 0 : _a.substring(0, 300)) + '...');
            return data;
        }
        // Fallback to traditional scraping
        console.log('⚠️ Using traditional scraping method...');
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
        // Extract reviews and ratings
        const reviewsCount = $('#acrCustomerReviewText').text().replace(/[^\d]/g, '') ||
            $('[data-hook="total-review-count"]').text().replace(/[^\d]/g, '') ||
            '0';
        const stars = $('span.a-icon-alt').first().text().replace(/[^\d.]/g, '') ||
            ((_b = $('#acrPopover').attr('title')) === null || _b === void 0 ? void 0 : _b.replace(/[^\d.]/g, '')) ||
            '0';
        // Extract category
        const category = $('#wayfinding-breadcrumbs_feature_div ul.a-unordered-list li:nth-last-child(2) span.a-list-item a').text().trim() ||
            $('.a-color-tertiary.a-size-base').first().text().trim() ||
            'General';
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
            category: category || 'General',
            reviewsCount: Number(reviewsCount) || 0,
            stars: Number(stars) || 0,
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
        console.log('⭐ Rating:', data.stars, '| Reviews:', data.reviewsCount);
        console.log('📦 Category:', data.category);
        console.log('📝 Description length:', data.description.length, 'chars');
        return data;
    }
    catch (error) {
        console.error('❌ Scraper error:', error.message);
        console.error('Stack:', error.stack);
    }
}
exports.scrapeAmazonProduct = scrapeAmazonProduct;
