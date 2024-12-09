"use strict";
"use server";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeAmazonProduct = void 0;
var axios_1 = __importDefault(require("axios"));
var cheerio = __importStar(require("cheerio"));
var utils_1 = require("../utils");
function scrapeAmazonProduct(url) {
    return __awaiter(this, void 0, void 0, function () {
        var username, password, port, session_id, options, response, $, title, currentPrice, originalPrice, outOfStock, images, imageUrls, currency, discountRate, description, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!url)
                        return [2 /*return*/];
                    username = String(process.env.BRIGHT_DATA_USERNAME);
                    password = String(process.env.BRIGHT_DATA_PASSWORD);
                    port = 22225;
                    session_id = (1000000 * Math.random()) | 0;
                    options = {
                        auth: {
                            username: "".concat(username, "-session-").concat(session_id),
                            password: password,
                        },
                        host: 'brd.superproxy.io',
                        port: port,
                        rejectUnauthorized: false,
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(url, options)];
                case 2:
                    response = _a.sent();
                    $ = cheerio.load(response.data);
                    title = $('#productTitle').text().trim();
                    currentPrice = (0, utils_1.extractPrice)($('.priceToPay span.a-price-whole'), $('.a.size.base.a-color-price'), $('.a-button-selected .a-color-base'));
                    originalPrice = (0, utils_1.extractPrice)($('#priceblock_ourprice'), $('.a-price.a-text-price span.a-offscreen'), $('#listPrice'), $('#priceblock_dealprice'), $('.a-size-base.a-color-price'));
                    outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';
                    images = $('#imgBlkFront').attr('data-a-dynamic-image') ||
                        $('#landingImage').attr('data-a-dynamic-image') ||
                        '{}';
                    imageUrls = Object.keys(JSON.parse(images));
                    currency = (0, utils_1.extractCurrency)($('.a-price-symbol'));
                    discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
                    description = (0, utils_1.extractDescription)($);
                    data = {
                        url: url,
                        currency: currency || '$',
                        image: imageUrls[0],
                        title: title,
                        currentPrice: Number(currentPrice) || Number(originalPrice),
                        originalPrice: Number(originalPrice) || Number(currentPrice),
                        priceHistory: [],
                        discountRate: Number(discountRate),
                        category: 'category',
                        reviewsCount: 100,
                        stars: 4.5,
                        isOutOfStock: outOfStock,
                        description: description,
                        lowestPrice: Number(currentPrice) || Number(originalPrice),
                        highestPrice: Number(originalPrice) || Number(currentPrice),
                        averagePrice: Number(currentPrice) || Number(originalPrice),
                    };
                    return [2 /*return*/, data];
                case 3:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.scrapeAmazonProduct = scrapeAmazonProduct;
