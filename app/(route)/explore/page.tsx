"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Search } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import DisplayProductList from "@/components/DisplayProductList";

interface Product {
  id: string;
  title: string;
  price: number;
  category?: string;
  image?: string;
  link?: string;
}

const ExplorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";

  const fetchProducts = useCallback(
    async (currentOffset: number) => {
      try {
        setLoading(true);
        const response = await axios.post("/api/all-product", {
          limit: 9,
          offset: currentOffset,
          searchText: searchQuery,
        });

        const newProducts = response.data.data;
        setHasMore(newProducts.length > 0);

        if (currentOffset === 0) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    fetchProducts(0);
    setOffset(0);
  }, [fetchProducts]);

  const handleSearch = () => {
    setOffset(0);
    fetchProducts(0);
  };

  const handleLoadMore = () => {
    const newOffset = offset + 9;
    setOffset(newOffset);
    fetchProducts(newOffset);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Products</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our curated collection of premium products for every need
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-6 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Product List */}
      <DisplayProductList productList={products} useremailId={userEmail} />

      {/* Load More Button */}
      {hasMore && products.length > 0 && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className={`px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Loading..." : "Load More Products"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;