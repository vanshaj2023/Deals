"use client";

import React, { useState } from 'react';
import ProductHeart from './ProductHeart';


const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<{ id: number; name: string; initialReviewsCount: number }[]>([]);

  const handleWishlistToggle = (product: { id: number; name: string; initialReviewsCount: number }) => {
    setWishlist((prevWishlist) => {
      if (prevWishlist.find((item) => item.id === product.id)) {
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        return [...prevWishlist, product];
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Wishlist</h1>
      <div className="grid grid-cols-1 gap-4">
        {wishlist.map((product) => (
          <div key={product.id} className="border p-4">
            <h2 className="text-xl">{product.name}</h2>
            {/* <ProductHeart product={product} onWishlistToggle={handleWishlistToggle} /> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
