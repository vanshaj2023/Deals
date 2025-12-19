export type PriceHistoryItem = {
  price: number;
  date: Date; 
};

export type User = {
  email: string;
};

export type ProductType = 'scraped' | 'promoted';

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
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: boolean;
  createdAt: Date;
  users?: User[];
  productType: ProductType; // 'scraped' = from Amazon/bot, 'promoted' = manually added trending
  isPromoted?: boolean;
  promotedBy?: string;
  promotedAt?: Date;
  about?: string;
  link?: string;
};

export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
};
