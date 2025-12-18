"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const mongoose_1 = require("../lib/mongoose");
const index_1 = require("../lib/actions/index");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Connect to MongoDB
(0, mongoose_1.connectToDB)()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));
// Ensure BOT_TOKEN is defined
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
    throw new Error('BOT_TOKEN is not defined in the environment variables');
}
const bot = new node_telegram_bot_api_1.default(BOT_TOKEN, { polling: true });
// Listen for any messages in the group
bot.on('message', async (msg) => {
    console.log('Received message:', msg); // Log the entire message object
    // Check if the message is from a group
    if (msg.chat && (msg.chat.type === 'group' || msg.chat.type === 'supergroup')) {
        const text = msg.text || '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const links = text.match(urlRegex);
        if (links) {
            for (const link of links) {
                try {
                    await (0, index_1.scrapeAndStoreProduct)(link); // Use the existing function
                    console.log('Link processed:', link); // Log processed links
                }
                catch (error) {
                    console.error('Error scraping or storing deal:', error);
                }
            }
        }
    }
});
