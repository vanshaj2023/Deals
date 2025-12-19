"use client"
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import { useSession } from 'next-auth/react';
import gsap from 'gsap';
import AnimatedLoader from './AnimatedLoader';

const TrendingPage = () => {
  const [productList, setProductList] = useState([]);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch product list on component mount
    GetProductList();
  }, []);

  const GetProductList = async () => {
    setLoading(true);
    try {
      const result = await axios.get('/api/trending');
      console.log('API Response:', result.data);
      
      if (result.data.success && result.data.data) {
        setProductList(result.data.data);
        console.log('Loaded products:', result.data.data.length);
      } else {
        console.log('No products found');
      }
    } catch (error) {
      console.error("Error fetching product list:", error);
    }
    setLoading(false);
  };

  // GSAP animations
  useEffect(() => {
    if (!loading && headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Trending Products</h1>
            <p className="text-sm text-gray-600 mt-1">Handpicked by our experts</p>
          </div>
          <AnimatedLoader count={10} />
        </div>
      </div>
    );
  }

  if (productList.length === 0) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Trending Products</h1>
            <p className="text-sm text-gray-600 mt-1">Handpicked by our experts</p>
          </div>
          <div className="text-center py-20">
            <p className="text-gray-500">No trending products available at the moment.</p>
            <p className="text-sm text-gray-400 mt-2">Check back soon!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div ref={headerRef} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Trending Products</h1>
          <p className="text-sm text-gray-600 mt-1">
            {productList.length} {productList.length === 1 ? 'product' : 'products'} handpicked by our experts
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {productList.map((product: any) => (
            <ProductCard 
              key={product._id}
              product={product}
              showWishlist={!!session?.user?.email}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;
