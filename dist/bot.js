"use strict";
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
var node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
var mongoose_1 = require("./lib/mongoose");
var index_1 = require("./lib/actions/index");
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Connect to MongoDB
(0, mongoose_1.connectToDB)()
    .then(function () { return console.log('Connected to MongoDB'); })
    .catch(function (err) { return console.error('Failed to connect to MongoDB:', err); });
// Ensure BOT_TOKEN is defined
var BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in the environment variables');
}
var bot = new node_telegram_bot_api_1.default(BOT_TOKEN, { polling: true });
// Listen for any messages in the group
bot.on('message', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var text, urlRegex, links, _i, links_1, link, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Received message:', msg); // Log the entire message object
                if (!(msg.chat && (msg.chat.type === 'group' || msg.chat.type === 'supergroup'))) return [3 /*break*/, 6];
                text = msg.text || '';
                urlRegex = /(https?:\/\/[^\s]+)/g;
                links = text.match(urlRegex);
                if (!links) return [3 /*break*/, 6];
                _i = 0, links_1 = links;
                _a.label = 1;
            case 1:
                if (!(_i < links_1.length)) return [3 /*break*/, 6];
                link = links_1[_i];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, index_1.scrapeAndStoreProduct)(link)];
            case 3:
                _a.sent(); // Use the existing function
                console.log('Link processed:', link); // Log processed links
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Error scraping or storing deal:', error_1);
                return [3 /*break*/, 5];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}); });
