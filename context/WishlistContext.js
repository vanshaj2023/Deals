import React, { createContext, useContext, useState } from 'react';

// Create context
const WishlistContext = createContext();

// Create provider
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    // Mock fetch
    const data = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];
    setWishlist(data);
  };

  const addToWishlist = (item) => {
    setWishlist((prev) => [...prev, item]);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, fetchWishlist, addToWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Custom hook to use the Wishlist context
export const useWishlist = () => {
  return useContext(WishlistContext);
};
