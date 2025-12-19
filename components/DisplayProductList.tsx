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
            return (
              <ProductCard 
                key={product._id}
                product={product}
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