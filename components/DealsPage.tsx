"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard'; // Using the same ProductCard component
import { Product } from '@/types';

const DealsPage: React.FC = () => {
  const [allDeals, setAllDeals] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get('/api/deals');
        const deals = response.data;
        setAllDeals(deals);
      } catch (err) {
        setError('Failed to fetch deals');
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Amazing Deals</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allDeals?.map((deal) => (<ProductCard key={deal._id} product={deal} />))}
        </div>
      </div>
    </div>
  );
};

export default DealsPage;
