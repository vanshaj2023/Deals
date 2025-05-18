import React, { useEffect, useState } from 'react';
import ProductCardItem from './ProductCardItem';
import axios from 'axios';

// This should match the Product type expected by ProductCardItem
interface Product {
  id: string;
  title: string;
  price: number;
  category?: string;
  image?: string;
  link?: string;
}

interface DisplayProductListProps {
  productList?: Product[];
  useremailId?: string;
}

const DisplayProductList = ({ productList = [], useremailId = '' }: DisplayProductListProps) => {
  //   const [isWishlisted, setIsWishlisted] = useState(false);

  // useEffect(() => {
  //   const checkWishlistStatus = async () => {
  //     if (!useremailId) return;

  //     try {
  //       const response = await axios.get(`/api/wishlist/check?useremail=${useremailId}&productId=${Product.id}`);
  //       setIsWishlisted(response.data.isInWishlist);
  //     } catch (error) {
  //       console.error("Error checking wishlist status:", error);
  //     }
  //   };

  //   checkWishlistStatus();
  // }, [useremailId, Product.id]);
  return (
    <div>
      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
        {/* Render product list or skeleton loaders */}
        {productList.length > 0 ? (
          productList.map((product, index) => (
            <ProductCardItem 
              product={product} 
              useremail={useremailId} 
              key={product.id} // Better to use product.id instead of index if available
            />
          ))
        ) : (
          // Skeleton Loader when there are no products
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