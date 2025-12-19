"use client";

import { useSession } from "next-auth/react";
import axios from "axios";
import { Search } from "lucide-react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import DisplayProductList from "@/components/DisplayProductList";
import gsap from "gsap";
import { Product } from "@/types";

const ExplorePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const { data: session } = useSession();
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  const userEmail = session?.user?.email || "";

  const fetchProducts = useCallback(
    async (currentOffset: number) => {
      try {
        setLoading(true);
        const response = await axios.post("/api/all-product", {
          limit: 10,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // GSAP animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
    if (searchRef.current) {
      gsap.fromTo(
        searchRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' }
      );
    }
  }, []);

  // Button hover animations
  useEffect(() => {
    if (loadMoreRef.current) {
      const handleMouseEnter = () => {
        gsap.to(loadMoreRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      const handleMouseLeave = () => {
        gsap.to(loadMoreRef.current, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      const button = loadMoreRef.current;
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [hasMore, products.length]);

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
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div ref={headerRef} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Explore Products</h1>
          <p className="text-sm text-gray-600 mt-1">Discover amazing deals</p>
        </div>

        {/* Search Bar */}
        <div ref={searchRef} className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-gray-900 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <DisplayProductList productList={products} useremailId={userEmail} />

        {hasMore && products.length > 0 && (
          <div className="text-center mt-8">
            <button
              ref={loadMoreRef}
              onClick={handleLoadMore}
              disabled={loading}
              className={`px-8 py-3 border border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;