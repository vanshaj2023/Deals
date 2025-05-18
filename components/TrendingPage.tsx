"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCardItem from './ProductCardItem';
import { useUser } from '@clerk/nextjs';

const TrendingPage = () => {
  const [productList, setProductList] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    // Fetch product list on component mount
    GetProductList();
  }, []);

  const GetProductList = async () => {
    try {
      const result = await axios.get('/api/trending');
      setProductList(result.data.data); // Update state with fetched data
      console.log(result.data.data); // Log fetched data directly
    } catch (error) {
      console.error("Error fetching product list:", error); // Handle errors gracefully
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
      {/* Render product list or skeleton loaders */}
      {productList?.length > 0
        ? productList.map((product, index) => (
            <ProductCardItem product={product} key={index} useremail={user?.primaryEmailAddress?.emailAddress || ""} />
          ))
        : [1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className="h-[200px] w-full bg-slate-200 rounded-lg animate-pulse"
            ></div>
          ))}
    </div>
    // <DisplayProductList productList={productList}/>
  );
};

export default TrendingPage;
