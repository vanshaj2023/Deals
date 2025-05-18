"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  productId: number;
  name: string;
  price: string;
  description: string;
  category: string;
  link?: string;
  image: string;
}

const WishlistPage = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const useremail = user?.primaryEmailAddress?.emailAddress || "";

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
  }, [fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: number) => {
    try {
      await axios.delete(`/api/wishlist?useremail=${useremail}&productId=${productId}`);
      // Optimistically update the UI
      setProductList(prev => prev.filter(item => item.productId !== productId));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setError("Failed to remove item from wishlist. Please try again.");
    }
  };

  if (loading) return <p className="text-center py-8">Loading wishlist...</p>;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
      
      {productList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productList.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              {/* Product Image */}
              <div className="relative h-48 w-full">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 h-full flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{product.category}</p>
                <p className="text-green-600 font-bold mb-4">${product.price}</p>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  {product.link ? (
                    <Link
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      View Product
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-sm">No link available</span>
                  )}

                  <button
                    onClick={() => handleRemoveFromWishlist(product.productId)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    aria-label="Remove from wishlist"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600 mb-4">Your wishlist is empty</p>
          <Link
            href="/trending"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;