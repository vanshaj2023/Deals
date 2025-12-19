"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCardItem from './ProductCardItem';
import { useSession } from 'next-auth/react';

const TrendingPage = () => {
  const [productList, setProductList] = useState([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product list on component mount
    GetProductList();
  }, []);

  const GetProductList = async () => {
    setLoading(true);
    try {
      const result = await axios.get('/api/trending');
      console.log('API Response:', result.data); // Debug log
      
      if (result.data.success && result.data.data) {
        // Transform MongoDB _id to id for ProductCardItem
        const transformedProducts = result.data.data.map((product: any) => ({
          id: product._id || product.id,
          title: product.title,
          price: product.currentPrice,
          category: product.category,
          image: product.image,
          link: product.link || product.url
        }));
        
        setProductList(transformedProducts);
        console.log('Loaded products:', transformedProducts.length);
      } else {
        console.log('No products found');
      }
    } catch (error) {
      console.error("Error fetching product list:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
        {[1, 2, 3, 4, 5, 6].map((_, index) => (
          <div
            key={index}
            className="h-[200px] w-full bg-slate-200 rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (productList.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-2xl text-gray-600">No product available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
      {productList.map((product, index) => (
        <ProductCardItem 
          product={product} 
          key={index} 
          useremail={user?.primaryEmailAddress?.emailAddress || ""} 
        />
      ))}
    </div>
  );
};

export default TrendingPage;
