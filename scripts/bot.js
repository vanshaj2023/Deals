const TelegramBot = require('node-telegram-bot-api');
const { connectToDB, scrapeAndStoreProduct } = require('../lib/actions/deal.actions');


// Connect to MongoDB
connectToDB();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Listen for any messages in the channel
bot.on('message', async (msg) => {
  const text = msg.text;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex);

  if (links) {
    for (const link of links) {
      try {
        await scrapeAndStoreProduct(link); // Use the existing function
      } catch (error) {
        console.error('Error scraping or storing deal:', error);
      }
    }
  }
});
