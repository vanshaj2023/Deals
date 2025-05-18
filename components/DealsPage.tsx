"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner'; // Assume we have a loading spinner component
import ErrorMessage from './ErrorMessage'; // Assume we have an error message component
import RefreshButton from './RefreshButton'; // Assume we have a refresh button component

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

const DealsPage: React.FC = () => {
  const [allDeals, setAllDeals] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [filter, setFilter] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  const fetchDeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/deals');
      let deals = response.data;

      // Apply sorting based on current filter
      switch (filter) {
        case 'newest':
          deals = deals.sort((a: Product, b: Product) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'price-low':
          deals = deals.sort((a: Product, b: Product) => a.currentPrice - b.currentPrice);
          break;
        case 'price-high':
          deals = deals.sort((a: Product, b: Product) => b.currentPrice - a.currentPrice);
          break;
      }

      setAllDeals(deals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch deals. Please try again later.');
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, RETRY_DELAY);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filter, retryCount]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals, retryCount]);

  const handleRefresh = () => {
    setRetryCount(0);
    fetchDeals();
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    // No need to fetch again, just re-sort existing data
    setAllDeals(prevDeals => {
      const sorted = [...prevDeals];
      switch (newFilter) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        case 'price-low':
          return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
        case 'price-high':
          return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
        default:
          return sorted;
      }
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left text-black">
            Amazing Deals
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => handleFilterChange('newest')}
                className={`px-3 py-1 rounded ${filter === 'newest' ? 'bg-black text-white' : 'bg-gray-200'}`}
              >
                Newest
              </button>
              <button 
                onClick={() => handleFilterChange('price-low')}
                className={`px-3 py-1 rounded ${filter === 'price-low' ? 'bg-black text-white' : 'bg-gray-200'}`}
              >
                Price: Low to High
              </button>
              <button 
                onClick={() => handleFilterChange('price-high')}
                className={`px-3 py-1 rounded ${filter === 'price-high' ? 'bg-black text-white' : 'bg-gray-200'}`}
              >
                Price: High to Low
              </button>
            </div>
            <RefreshButton onClick={handleRefresh} disabled={isLoading} />
          </div>
        </div>

        {isLoading && retryCount === 0 ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={retryCount < MAX_RETRIES ? handleRefresh : undefined}
          />
        ) : (
          <>
            {allDeals.length === 0 && !isLoading ? (
              <p className="text-center text-gray-500 py-8">No deals available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allDeals.map((deal) => (
                  <ProductCard key={deal._id} product={deal} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DealsPage;