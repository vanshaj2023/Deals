'use client';
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from './ProductCard';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AnimatedLoader from './AnimatedLoader';

gsap.registerPlugin(ScrollTrigger);

const DealsPage = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await axios.post('/api/all-product', {
          limit: 1000,
          offset: 0,
          searchText: ''
        });
        const allProducts = response.data.data || [];
        
        // Filter products with discountRate > 10 and sort by createdAt (newest first)
        const filtered = allProducts
          .filter((product: any) => product.discountRate > 10)
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setDiscountedProducts(filtered);
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

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
            <h1 className="text-2xl font-bold text-gray-900">Deals For You</h1>
            <p className="text-sm text-gray-600 mt-1">Best offers on trending products</p>
          </div>
          <AnimatedLoader count={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div ref={headerRef} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Deals For You</h1>
          <p className="text-sm text-gray-600 mt-1">
            {discountedProducts.length > 0 
              ? `${discountedProducts.length} products with best offers`
              : 'Best offers on trending products'
            }
          </p>
        </div>

        {/* Products Grid */}
        {discountedProducts.length > 0 ? (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {discountedProducts.map((product: any) => (
              <ProductCard 
                key={product._id} 
                product={product}
                showWishlist={!!session?.user?.email}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals available right now</h3>
            <p className="text-sm text-gray-500">Check back soon for amazing offers!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;