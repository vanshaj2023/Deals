import TelegramBot from 'node-telegram-bot-api';
import { connectToDB } from '../lib/mongoose';
import { scrapeAndStoreProduct } from '../lib/actions/index';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
connectToDB()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB:', err));

// Ensure BOT_TOKEN is defined
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not defined in the environment variables');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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
          await scrapeAndStoreProduct(link); // Use the existing function
          console.log('Link processed:', link); // Log processed links
        } catch (error) {
          console.error('Error scraping or storing deal:', error);
        }
      }
    }
  }
});
