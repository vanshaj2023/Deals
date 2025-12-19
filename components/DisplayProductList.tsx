import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface DisplayProductListProps {
  productList?: Product[];
  useremailId?: string;
}

const DisplayProductList = ({ productList = [], useremailId = '' }: DisplayProductListProps) => {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {productList.length > 0 ? (
          productList.map((product) => {
            const cleanProduct = {
              _id: product._id,
              title: product.title,
              currentPrice: product.currentPrice,
              originalPrice: product.originalPrice,
              currency: product.currency,
              category: product.category,
              image: product.image,
              url: product.url,
              stars: product.stars,
              reviewsCount: product.reviewsCount,
              discountRate: product.discountRate,
              isOutOfStock: product.isOutOfStock,
            };
            
            return (
              <ProductCard 
                key={product._id}
                product={cleanProduct as any}
                showWishlist={!!useremailId}
              />
            );
          })
        ) : (
          [1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
            <div
              key={index}
              className="h-[200px] w-full bg-slate-200 rounded-lg animate-pulse"
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default DisplayProductList;