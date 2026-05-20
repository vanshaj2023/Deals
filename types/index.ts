export type PriceHistoryItem = {
  price: number;
  date: Date;
};

export type Product = {
  _id: string;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[] | [];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  summary?: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  source: 'amazon' | 'myntra' | 'flipkart';
  createdAt: Date;
};

export type NotificationChannel = 'email' | 'telegram' | 'whatsapp';

export type TrackedProduct = {
  _id: string;
  userId: string;
  productId: string;
  product?: Product;
  targetPrice: number | null;
  thresholdPercent: number | null;
  channelOverride: NotificationChannel | null;
  paused: boolean;
  lastAlertAt: Date | null;
  createdAt: Date;
};

export type NotificationPrefs = {
  email: { enabled: boolean; address: string | null };
  telegram: { enabled: boolean; chatId: string | null };
  whatsapp: { enabled: boolean; phone: string | null; verified: boolean };
  defaultThresholdPercent: number;
};

export type NotificationType =
  | 'WELCOME'
  | 'CHANGE_OF_STOCK'
  | 'LOWEST_PRICE'
  | 'THRESHOLD_MET'
  | 'TARGET_PRICE_MET';

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
};
