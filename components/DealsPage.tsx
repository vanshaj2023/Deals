import { getAllProducts } from '@/lib/actions';
import React from 'react';
import ProductCard from './ProductCard';

const DealsPage = async () => {
  const allProducts = await getAllProducts();
  
  // Filter products with discountRate > 10 and sort by createdAt (newest first)
  const discountedProducts = allProducts
    ?.filter(product => product.discountRate > 10)
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Amazing Deals
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Limited-time offers with maximum discount
          </p>
          {discountedProducts.length > 0 && (
            <div className="mt-4 inline-block bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
              {discountedProducts.length} amazing deals waiting for you!
            </div>
          )}
        </div>

        {/* Products Grid */}
        {discountedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {discountedProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hot deals available</h3>
            <p className="mt-1 text-gray-500">
              We couldn't find any products with more than 10% discount. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;