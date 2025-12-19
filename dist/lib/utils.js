"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = exports.getEmailNotifType = exports.getAveragePrice = exports.getLowestPrice = exports.getHighestPrice = exports.extractDescription = exports.extractCurrency = exports.extractPrice = void 0;
const Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
};
const THRESHOLD_PERCENTAGE = 40;
// Extracts and returns the price from a list of possible elements.
function extractPrice(...elements) {
    var _a;
    for (const element of elements) {
        const priceText = element.text().trim();
        if (priceText) {
            const cleanPrice = priceText.replace(/[^\d.]/g, '');
            let firstPrice;
            if (cleanPrice) {
                firstPrice = (_a = cleanPrice.match(/\d+\.\d{2}/)) === null || _a === void 0 ? void 0 : _a[0];
            }
            return firstPrice || cleanPrice;
        }
    }
    return '';
}
exports.extractPrice = extractPrice;
// Extracts and returns the currency symbol from an element.
function extractCurrency(element) {
    const currencyText = element.text().trim().slice(0, 1);
    return currencyText ? currencyText : "";
}
exports.extractCurrency = extractCurrency;
// Extracts description from two possible elements from amazon
function extractDescription($) {
    const selectors = [
        "#feature-bullets ul li span.a-list-item",
        ".a-unordered-list .a-list-item",
        ".a-expander-content p",
        "#productDescription p",
    ];
    for (const selector of selectors) {
        const elements = $(selector);
        if (elements.length > 0) {
            const textContent = elements
                .map((_, element) => {
                let text = $(element).text().trim();
                // Remove common noise patterns
                text = text.replace(/\(function\(\)[^\}]*\}\);/g, ''); // Remove JavaScript
                text = text.replace(/P\.when\([^\)]*\);/g, ''); // Remove P.when calls
                text = text.replace(/\.review-text-read-more[^\n]*$/gm, ''); // Remove read-more text
                text = text.replace(/Read more|Helpful|Report/g, ''); // Remove UI text
                text = text.replace(/\s+/g, ' '); // Normalize whitespace
                return text;
            })
                .get()
                .filter((text) => text.length > 10) // Remove very short entries
                .join(". ");
            // Clean up the final text
            let cleanText = textContent
                .replace(/\.\s*\./g, '.') // Remove double periods
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
            // Limit to reasonable length (first 500 words or ~2500 chars)
            if (cleanText.length > 2500) {
                cleanText = cleanText.substring(0, 2500).trim() + '...';
            }
            return cleanText;
        }
    }
    return "";
}
exports.extractDescription = extractDescription;
function getHighestPrice(priceList) {
    let highestPrice = priceList[0];
    for (let i = 0; i < priceList.length; i++) {
        if (priceList[i].price > highestPrice.price) {
            highestPrice = priceList[i];
        }
    }
    return highestPrice.price;
}
exports.getHighestPrice = getHighestPrice;
function getLowestPrice(priceList) {
    let lowestPrice = priceList[0];
    for (let i = 0; i < priceList.length; i++) {
        if (priceList[i].price < lowestPrice.price) {
            lowestPrice = priceList[i];
        }
    }
    return lowestPrice.price;
}
exports.getLowestPrice = getLowestPrice;
function getAveragePrice(priceList) {
    const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
    const averagePrice = sumOfPrices / priceList.length || 0;
    return averagePrice;
}
exports.getAveragePrice = getAveragePrice;
const getEmailNotifType = (scrapedProduct, currentProduct) => {
    const lowestPrice = getLowestPrice(currentProduct.priceHistory);
    if (scrapedProduct.currentPrice < lowestPrice) {
        return Notification.LOWEST_PRICE;
    }
    if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
        return Notification.CHANGE_OF_STOCK;
    }
    if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
        return Notification.THRESHOLD_MET;
    }
    return null;
};
exports.getEmailNotifType = getEmailNotifType;
const formatNumber = (num = 0) => {
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
exports.formatNumber = formatNumber;
