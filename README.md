# PriceIQ - Price Tracking & Deal Alert System

> Automated price tracking system with Telegram bot integration, email alerts, and trending products showcase.

## 🚀 Features

### Core Features
- 🤖 **Telegram Bot Integration** - Automatically scrapes product URLs shared in Telegram groups
- 📊 **Price Tracking** - Monitors price changes for Amazon products
- 📧 **Email Alerts** - Notifies users when prices drop
- ⭐ **Trending Section** - Promotes featured products from verified users
- 💝 **Wishlist** - Save favorite products for quick access
- 🔒 **Authentication** - Secure user authentication with Clerk.js

### Technical Features
- ⚡ Next.js 14 with App Router
- 🗄️ MongoDB for all data storage (users, products, wishlist)
- 🔍 BrightData web scraping with proxy support
- 📮 Nodemailer email notifications
- 🔄 Automated cron jobs for price updates
- 🎨 Tailwind CSS for styling

## 📦 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Clerk.js
- **Web Scraping**: Cheerio + Axios with BrightData proxies
- **Bot**: Telegram Bot API
- **Email**: Nodemailer

## 🗄️ Database Structure

### MongoDB Collections

**Users**
- Stores user information and roles
- Supports authentication

**Products**
- Product details with price history
- Tracking subscribers
- Promotion status for trending section

**Wishlist**
- Links users to their favorite products

[View detailed schema →](MIGRATION_SUMMARY.md#-new-database-structure)

## 🛠️ Setup

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Telegram Bot Token
- BrightData account (for web scraping)
- Email account for notifications

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Deals-1
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file:
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Telegram Bot
BOT_TOKEN=your_telegram_bot_token

# Web Scraper (BrightData)
BRIGHT_DATA_USERNAME=your_username
BRIGHT_DATA_PASSWORD=your_password

# Email
EMAIL_PASSWORD=your_email_app_password

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

4. **Verify migration (optional)**
```bash
npx ts-node verify-migration.ts
```

5. **Run development server**
```bash
npm run dev
```

6. **Run Telegram bot (separate terminal)**
```bash
npm run start-bot
```

## 📋 Usage

### For Users

1. **Track a Product**
   - Share Amazon product URL in Telegram group
   - Or manually add via web interface

2. **Set Price Alerts**
   - Click "Track" on any product
   - Enter email to receive alerts
   - Get notified when price drops

3. **Browse Trending**
   - View promoted products from verified sellers
   - Add to wishlist
   - Quick access to deals

### For Promoters

1. **Add Promoted Product**
```bash
POST /api/trending
```

2. **View Your Products**
```bash
GET /api/trending?email=your@email.com
```

## 🔄 How It Works

```
Telegram Bot → Detects URL → Scrapes Product → Saves to MongoDB
                                    ↓
                          Updates Price History
                                    ↓
                            Checks Price Drop
                                    ↓
                         Sends Email Alerts
```

### Automated Price Updates

A cron job runs periodically to:
1. Fetch all tracked products
2. Re-scrape current prices
3. Update price history
4. Send alerts if prices dropped

```typescript
// Triggered via /api/cron
GET /api/cron  // Scheduled via external service
```

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Auth pages (sign-in, sign-up)
│   ├── (route)/         # Protected routes
│   ├── api/             # API endpoints
│   └── products/        # Product detail pages
├── components/          # React components
├── lib/
│   ├── models/          # MongoDB models
│   ├── actions/         # Server actions
│   ├── scraper/         # Web scraping logic
│   └── nodemailer/      # Email templates
├── scripts/
│   └── bot.ts           # Telegram bot
└── types/               # TypeScript types
```

## 🔧 API Endpoints

### Products
- `POST /api/trending` - Add promoted product
- `GET /api/trending` - Get trending products
- `GET /api/trending?email=x` - Get user's promoted products

### Wishlist
- `POST /api/wishlist` - Add to wishlist
- `GET /api/wishlist?userId=email` - Get user wishlist
- `DELETE /api/wishlist?useremail=x&productId=y` - Remove from wishlist

### Users
- `POST /api/user` - Create/get user
- `GET /api/user?email=x` - Get user by email

### Cron
- `GET /api/cron` - Update all product prices

## 📚 Documentation

- [Migration Summary](MIGRATION_SUMMARY.md) - Database migration details
- [MongoDB Migration](MONGODB_MIGRATION.md) - Migration guide
- [DB Helpers](lib/db-helpers.ts) - Utility functions

## 🐛 Known Issues

- Scraper only supports Amazon currently
- Email sender is hardcoded (needs env variable)
- Rate limiting not implemented

## 🔮 Future Enhancements

### Planned Features
- [ ] Migrate to NextAuth (replace Clerk)
- [ ] Support multiple e-commerce sites
- [ ] User dashboard with analytics
- [ ] Price prediction ML model
- [ ] Browser extension
- [ ] Mobile app with push notifications
- [ ] Admin panel for promoters
- [ ] Email queue system

### Improvements
- [ ] Add Redis caching
- [ ] Implement rate limiting
- [ ] Better error handling
- [ ] Comprehensive test coverage
- [ ] Performance optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Vanshaj**
- GitHub: [@vanshaj2023](https://github.com/vanshaj2023)

## 🙏 Acknowledgments

- BrightData for web scraping infrastructure
- MongoDB for database solution
- Clerk for authentication
- Next.js team for the amazing framework

---

Made with ❤️ for deal hunters and smart shoppers!
