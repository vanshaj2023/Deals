"use strict";
"use server";
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
exports.sendEmail = exports.generateEmailBody = void 0;
var nodemailer_1 = __importDefault(require("nodemailer"));
var Notification = {
    WELCOME: 'WELCOME',
    CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
    LOWEST_PRICE: 'LOWEST_PRICE',
    THRESHOLD_MET: 'THRESHOLD_MET',
};
function generateEmailBody(product, type) {
    return __awaiter(this, void 0, void 0, function () {
        var THRESHOLD_PERCENTAGE, shortenedTitle, subject, body;
        return __generator(this, function (_a) {
            THRESHOLD_PERCENTAGE = 40;
            shortenedTitle = product.title.length > 20
                ? "".concat(product.title.substring(0, 20), "...")
                : product.title;
            subject = "";
            body = "";
            switch (type) {
                case Notification.WELCOME:
                    subject = "Welcome to Price Tracking for ".concat(shortenedTitle);
                    body = "\n        <div>\n          <h2>Welcome to PriceWise \uD83D\uDE80</h2>\n          <p>You are now tracking ".concat(product.title, ".</p>\n          <p>Here's an example of how you'll receive updates:</p>\n          <div style=\"border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;\">\n            <h3>").concat(product.title, " is back in stock!</h3>\n            <p>We're excited to let you know that ").concat(product.title, " is now back in stock.</p>\n            <p>Don't miss out - <a href=\"").concat(product.url, "\" target=\"_blank\" rel=\"noopener noreferrer\">buy it now</a>!</p>\n            <img src=\"https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png\" alt=\"Product Image\" style=\"max-width: 100%;\" />\n          </div>\n          <p>Stay tuned for more updates on ").concat(product.title, " and other products you're tracking.</p>\n        </div>\n      ");
                    break;
                case Notification.CHANGE_OF_STOCK:
                    subject = "".concat(shortenedTitle, " is now back in stock!");
                    body = "\n        <div>\n          <h4>Hey, ".concat(product.title, " is now restocked! Grab yours before they run out again!</h4>\n          <p>See the product <a href=\"").concat(product.url, "\" target=\"_blank\" rel=\"noopener noreferrer\">here</a>.</p>\n        </div>\n      ");
                    break;
                case Notification.LOWEST_PRICE:
                    subject = "Lowest Price Alert for ".concat(shortenedTitle);
                    body = "\n        <div>\n          <h4>Hey, ".concat(product.title, " has reached its lowest price ever!!</h4>\n          <p>Grab the product <a href=\"").concat(product.url, "\" target=\"_blank\" rel=\"noopener noreferrer\">here</a> now.</p>\n        </div>\n      ");
                    break;
                case Notification.THRESHOLD_MET:
                    subject = "Discount Alert for ".concat(shortenedTitle);
                    body = "\n        <div>\n          <h4>Hey, ".concat(product.title, " is now available at a discount more than ").concat(THRESHOLD_PERCENTAGE, "%!</h4>\n          <p>Grab it right away from <a href=\"").concat(product.url, "\" target=\"_blank\" rel=\"noopener noreferrer\">here</a>.</p>\n        </div>\n      ");
                    break;
                default:
                    throw new Error("Invalid notification type.");
            }
            return [2 /*return*/, { subject: subject, body: body }];
        });
    });
}
exports.generateEmailBody = generateEmailBody;
var transporter = nodemailer_1.default.createTransport({
    pool: true,
    service: 'hotmail',
    port: 2525,
    auth: {
        user: 'javascriptmastery@outlook.com',
        pass: process.env.EMAIL_PASSWORD,
    },
    maxConnections: 1
});
var sendEmail = function (emailContent, sendTo) { return __awaiter(void 0, void 0, void 0, function () {
    var mailOptions;
    return __generator(this, function (_a) {
        mailOptions = {
            from: 'javascriptmastery@outlook.com',
            to: sendTo,
            html: emailContent.body,
            subject: emailContent.subject,
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error)
                return console.log(error);
            console.log('Email sent: ', info);
        });
        return [2 /*return*/];
    });
}); };
exports.sendEmail = sendEmail;
