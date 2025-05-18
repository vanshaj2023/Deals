"use client";

import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import ProductCardItem from "@/components/ProductCardItem";

// Define a type for the product structure (replace with actual structure as necessary)
interface Product {
    id: string;
  title: string;
  price: number;
  category?: string;
  image?: string;
  link?: string;
}

const UserListing: React.FC = () => {
  // Define states with proper typing
  const [listing, setListing] = useState<Product[]>([]); // Array to store product data
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error message state
  const { isLoaded, user } = useUser(); // Clerk's `useUser` hook for authentication

  // Fetch products when `user` data becomes available
  useEffect(() => {
    if (isLoaded && user) {
      GetTrendingProductList();
    }
  }, [isLoaded, user]); // Dependencies: `isLoaded`, `user`

  // Fetch trending product list
  const GetTrendingProductList = async () => {
    try {
      setLoading(true); // Start loading
      setError(null); // Reset previous errors

      const result = await axios.get(
        `/api/trending?email=${user?.primaryEmailAddress?.emailAddress}`
      );

      console.log("API Response:", result.data); // Debug API response

      if (result.data?.success && Array.isArray(result.data.data)) {
        // Check response structure and set product list
        setListing(result.data.data);
      } else {
        console.error("Invalid response format:", result.data);
        setListing([]); // Fallback to an empty list
        setError("Unexpected response format from the server."); // Handle unexpected formats
      }
    } catch (err) {
      console.error("Error fetching trending products:", err);
      setListing([]); // Clear listing in case of error
      setError("Failed to fetch products. Please try again later."); // Set a user-friendly error message
    } finally {
      setLoading(false); // Always stop the loading spinner
    }
  };

  return (
    <div className="mt-5">
      {/* Header with title and add product button */}
      <h2 className="font-bold text-xl flex justify-between items-center">
        Listing
        <Link href="/add-product">
          <button>+ Add new product</button>
        </Link>
      </h2>

      {/* Main content area */}
      <div>
        {loading ? (
          // Loading indicator
          <h2 className="font-medium text-center text-gray-500">Loading...</h2>
        ) : error ? (
          // Error message
          <h2 className="font-medium text-center text-red-500">{error}</h2>
        ) : listing.length === 0 ? (
          // Empty state when no products are available
          <h2 className="font-medium text-center text-gray-500">
            No products found
          </h2>
        ) : (
          // Render product cards
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listing.map((product) => (
              <ProductCardItem
                key={product.id}
                product={product}
                useremail={user?.primaryEmailAddress?.emailAddress ?? ""} // Pass user email for wishlist functionality
                editable={true} // Allow edit options
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListing;