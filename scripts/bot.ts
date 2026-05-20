import TelegramBot from 'node-telegram-bot-api';
import { connectToDB } from '../lib/mongoose';
import { scrapeAndStoreProduct } from '../lib/actions/index';
import dotenv from 'dotenv';
dotenv.config();

connectToDB().catch(err => { throw err });

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined in the environment variables');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on('message', async (msg) => {
  if (msg.chat && (msg.chat.type === 'group' || msg.chat.type === 'supergroup')) {
    const text = msg.text || '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const links = text.match(urlRegex);

    if (links) {
      for (const link of links) {
        await scrapeAndStoreProduct(link);
      }
    }
  }
});
