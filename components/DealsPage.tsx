"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Product } from '@/types';
import ProductCard from './ProductCard';

const DealsPage: React.FC = () => {
  const [allDeals, setAllDeals] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/deals');
      let deals = response.data;

      // Sort deals to have new products appear first
      deals = deals.sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setAllDeals(deals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deals. Please try again later.');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          fetchDeals();
        }, 5000); // Retry after 5 seconds
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [retryCount]);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Amazing Deals</h1>
        {isLoading ? (
          <p className="text-center">Loading deals...</p>
        ) : error ? (
          <p className="text-red-500 text-center mb-4">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allDeals?.map((deal) => (
              <ProductCard key={deal._id} product={deal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;

