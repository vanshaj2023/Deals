import { PriceHistoryItem, Product } from "@/types";

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

const THRESHOLD_PERCENTAGE = 40;

export function extractPrice(...elements: any) {
  for (const element of elements) {
    const priceText = element.text().trim();

    if(priceText) {
      const cleanPrice = priceText.replace(/[^\d.]/g, '');

      let firstPrice; 

      if (cleanPrice) {
        firstPrice = cleanPrice.match(/\d+\.\d{2}/)?.[0];
      } 

      return firstPrice || cleanPrice;
    }
  }

  return '';
}

export function extractCurrency(element: any) {
  const currencyText = element.text().trim().slice(0, 1);
  return currencyText ? currencyText : "";
}

export function extractDescription($: any) {
  const selectors = [
    "#feature-bullets ul li span.a-list-item",
    ".a-unordered-list .a-list-item",
    ".a-expander-content p",
    "#productDescription p",
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      const textContent = elements
        .map((_: any, element: any) => {
          let text = $(element).text().trim();
          text = text.replace(/\(function\(\)[^\}]*\}\);/g, ''); 
          text = text.replace(/P\.when\([^\)]*\);/g, ''); 
          text = text.replace(/\.review-text-read-more[^\n]*$/gm, ''); 
          text = text.replace(/Read more|Helpful|Report/g, ''); 
          text = text.replace(/\s+/g, ' '); 
          return text;
        })
        .get()
        .filter((text: string) => text.length > 10)
        .join(". ");
      
      let cleanText = textContent
        .replace(/\.\s*\./g, '.') 
        .replace(/\s+/g, ' ') 
        .trim();
      
      if (cleanText.length > 2500) {
        cleanText = cleanText.substring(0, 2500).trim() + '...';
      }
      
      return cleanText;
    }
  }

  return "";
}

export function getHighestPrice(priceList: PriceHistoryItem[]): number {
  let highestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price > highestPrice.price) {
      highestPrice = priceList[i];
    }
  }

  return highestPrice.price;
}

export function getLowestPrice(priceList: PriceHistoryItem[]): number {
  let lowestPrice = priceList[0];

  for (let i = 0; i < priceList.length; i++) {
    if (priceList[i].price < lowestPrice.price) {
      lowestPrice = priceList[i];
    }
  }

  return lowestPrice.price;
}

export function getAveragePrice(priceList: PriceHistoryItem[]): number {
  const sumOfPrices = priceList.reduce((acc, curr) => acc + curr.price, 0);
  const averagePrice = sumOfPrices / priceList.length || 0;

  return averagePrice;
}

export const getEmailNotifType = (
  scrapedProduct: Omit<Product, '_id'>,
  currentProduct: Product
): keyof typeof Notification | null => {
  const lowestPrice = getLowestPrice(currentProduct.priceHistory);

  if (scrapedProduct.currentPrice < lowestPrice) {
    return Notification.LOWEST_PRICE as keyof typeof Notification;
  }
  if (!scrapedProduct.isOutOfStock && currentProduct.isOutOfStock) {
    return Notification.CHANGE_OF_STOCK as keyof typeof Notification;
  }
  if (scrapedProduct.discountRate >= THRESHOLD_PERCENTAGE) {
    return Notification.THRESHOLD_MET as keyof typeof Notification;
  }

  return null;
};

export const formatNumber = (num: number = 0): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
