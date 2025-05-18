import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  // Calculate discount percentage if original price exists
  const discountPercentage = product.originalPrice && product.currentPrice
    ? Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)
    : 0;

  return (
    <Link 
      href={`/products/${product._id}`} 
      className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
      aria-label={`View ${product.title}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image 
          src={product.image}
          alt={product.title}
          width={300}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          priority={false}
        />
        
        {/* Discount badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {discountPercentage}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-gray-400 line-through text-sm">
                {product.currency} {product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              {product.currency} {product.currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Rating (if available) */}
          {product.reviewsCount && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-yellow-500 mr-1">★</span>
              {product.reviewsCount.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;