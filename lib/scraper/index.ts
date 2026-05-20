"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

type AiExtractedData = {
  title: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  stars: number;
  reviewsCount: number;
  category: string;
  description: string;
  isOutOfStock: boolean;
  discountRate: number;
};

async function extractWithAI(html: string): Promise<AiExtractedData | null> {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey || openaiApiKey.trim() === '') {
    return null;
  }

  try {
    const trimmedHtml = html.substring(0, 100000);

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
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
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content.trim();
    const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonContent) as AiExtractedData;
  } catch {
    return null;
  }
}

export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;

  const options = {
    auth: {
      username: `${username}-session-${session_id}`,
      password,
    },
    host: 'brd.superproxy.io',
    port,
    rejectUnauthorized: false,
  }

  try {
    const response = await axios.get(url, options);
    const html = response.data;
    const $ = cheerio.load(html);

    const aiData = await extractWithAI(html);

    if (aiData) {
      const images =
        $('#imgBlkFront').attr('data-a-dynamic-image') ||
        $('#landingImage').attr('data-a-dynamic-image') ||
        '{}';
      const imageUrls = Object.keys(JSON.parse(images));

      return {
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
        source: 'amazon' as const,
      };
    }

    const title = $('#productTitle').text().trim();
    const currentPrice = extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('.a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
    );

    const originalPrice = extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
    );

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images =
      $('#imgBlkFront').attr('data-a-dynamic-image') ||
      $('#landingImage').attr('data-a-dynamic-image') ||
      '{}'

    const imageUrls = Object.keys(JSON.parse(images));

    const currency = extractCurrency($('.a-price-symbol'))
    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const description = extractDescription($)

    const reviewsCount = $('#acrCustomerReviewText').text().replace(/[^\d]/g, '') ||
                        $('[data-hook="total-review-count"]').text().replace(/[^\d]/g, '') ||
                        '0';

    const stars = $('span.a-icon-alt').first().text().replace(/[^\d.]/g, '') ||
                  $('#acrPopover').attr('title')?.replace(/[^\d.]/g, '') ||
                  '0';

    const category = $('#wayfinding-breadcrumbs_feature_div ul.a-unordered-list li:nth-last-child(2) span.a-list-item a').text().trim() ||
                     $('.a-color-tertiary.a-size-base').first().text().trim() ||
                     'General';

    return {
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
      productType: 'scraped' as const,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Scraper failed: ${message}`);
  }
}
