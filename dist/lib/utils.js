"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = exports.getEmailNotifType = exports.getAveragePrice = exports.getLowestPrice = exports.getHighestPrice = exports.extractDescription = exports.extractCurrency = exports.extractPrice = void 0;
var Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
};
var THRESHOLD_PERCENTAGE = 40;
// Extracts and returns the price from a list of possible elements.
function extractPrice() {
    var _a;
    var elements = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        elements[_i] = arguments[_i];
    }
    for (var _b = 0, elements_1 = elements; _b < elements_1.length; _b++) {
        var element = elements_1[_b];
        var priceText = element.text().trim();
        if (priceText) {
            var cleanPrice = priceText.replace(/[^\d.]/g, '');
            var firstPrice = void 0;
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
    var currencyText = element.text().trim().slice(0, 1);
    return currencyText ? currencyText : "";
}
exports.extractCurrency = extractCurrency;
// Extracts description from two possible elements from amazon
function extractDescription($) {
    // these are possible elements holding description of the product
    var selectors = [
        ".a-unordered-list .a-list-item",
        ".a-expander-content p",
        // Add more selectors here if needed
    ];
    for (var _i = 0, selectors_1 = selectors; _i < selectors_1.length; _i++) {
        var selector = selectors_1[_i];
        var elements = $(selector);
        if (elements.length > 0) {
            var textContent = elements
                .map(function (_, element) { return $(element).text().trim(); })
                .get()
                .join("\n");
            return textContent;
        }
    }
    // If no matching elements were found, return an empty string
    return "";
}
exports.extractDescription = extractDescription;
function getHighestPrice(priceList) {
    var highestPrice = priceList[0];
    for (var i = 0; i < priceList.length; i++) {
        if (priceList[i].price > highestPrice.price) {
            highestPrice = priceList[i];
        }
    }
    return highestPrice.price;
}
exports.getHighestPrice = getHighestPrice;
function getLowestPrice(priceList) {
    var lowestPrice = priceList[0];
    for (var i = 0; i < priceList.length; i++) {
        if (priceList[i].price < lowestPrice.price) {
            lowestPrice = priceList[i];
        }
    }
    return lowestPrice.price;
}
exports.getLowestPrice = getLowestPrice;
function getAveragePrice(priceList) {
    var sumOfPrices = priceList.reduce(function (acc, curr) { return acc + curr.price; }, 0);
    var averagePrice = sumOfPrices / priceList.length || 0;
    return averagePrice;
}
exports.getAveragePrice = getAveragePrice;
var getEmailNotifType = function (scrapedProduct, currentProduct) {
    var lowestPrice = getLowestPrice(currentProduct.priceHistory);
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
var formatNumber = function (num) {
    if (num === void 0) { num = 0; }
    return num.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
exports.formatNumber = formatNumber;
