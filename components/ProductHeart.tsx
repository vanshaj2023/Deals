"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductHeartProps {
  product: Product;
  onWishlistToggle: (product: Product) => void;
}

const ProductHeart: React.FC<ProductHeartProps> = ({ product, onWishlistToggle }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(product.reviewsCount);

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    setReviewsCount(isWishlisted ? reviewsCount - 1 : reviewsCount + 1);
    onWishlistToggle(product);
  };

  return (
    <div className="product-hearts flex items-center gap-3" onClick={handleWishlistToggle} style={{ cursor: 'pointer' }}>
      <Image
        src={isWishlisted ? "/assets/icons/black1-heart.svg" : "/assets/icons/red-heart.svg"}
        alt="heart"
        width={20}
        height={20}
      />
      <p className="text-base font-semibold text-[#D46F77]">
        {reviewsCount}
      </p>
    </div>
  );
};

export default ProductHeart;
