"use client";

import { useSession } from "next-auth/react";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

interface WishlistProduct {
  _id: string;
  title: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  category?: string;
  image: string;
  url?: string;
  stars?: number;
  reviewsCount?: number;
  discountRate?: number;
  isOutOfStock?: boolean;
}

const WishlistPage = () => {
  const [productList, setProductList] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const useremail = session?.user?.email || "";

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await axios.get(`/api/wishlist?userId=${useremail}`);
      setProductList(result.data.data || []);
    } catch (err) {
      console.error("Error fetching wishlist products:", err);
      setError("Failed to fetch wishlist. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [useremail]);

  useEffect(() => {
    if (useremail) {
      fetchWishlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useremail]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-600 mt-1">Your saved items</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
              <div
                key={index}
                className="h-[400px] w-full bg-gray-100 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-sm text-gray-600 mt-1">
            {productList.length > 0 
              ? `${productList.length} ${productList.length === 1 ? 'item' : 'items'} saved`
              : 'Your saved items'
            }
          </p>
        </div>

        {/* Products Grid */}
        {productList.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {productList.map((product) => (
              <ProductCard 
                key={product._id}
                product={product}
                showWishlist={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-gray-500 mb-2">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-6">Save items you like to buy them later</p>
            <Link
              href="/explore"
              className="inline-block px-6 py-3 border border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;