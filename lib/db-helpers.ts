/**
 * MongoDB Helper Functions
 * Common database queries and operations
 */

import { connectToDB } from "@/lib/mongoose";
import User from "@/lib/models/user.model";
import Product from "@/lib/models/product.model";
import Wishlist from "@/lib/models/wishlist.model";

/**
 * Find or create a user by email
 */
export async function findOrCreateUser(email: string, name?: string, role: 'user' | 'admin' | 'promoter' = 'user') {
  await connectToDB();
  
  let user = await User.findOne({ email });
  
  if (!user) {
    user = await User.create({
      email,
      name: name || email.split('@')[0],
      role,
    });
  }
  
  return user;
}

/**
 * Get all promoted/trending products
 */
export async function getTrendingProducts(limit: number = 50) {
  await connectToDB();
  
  return await Product.find({ isPromoted: true })
    .sort({ promotedAt: -1 })
    .limit(limit);
}

/**
 * Get products by promoter email
 */
export async function getProductsByPromoter(email: string) {
  await connectToDB();
  
  return await Product.find({ 
    isPromoted: true, 
    promotedBy: email 
  }).sort({ promotedAt: -1 });
}

/**
 * Get user's wishlist with populated products
 */
export async function getUserWishlist(email: string) {
  await connectToDB();
  
  const user = await User.findOne({ email });
  if (!user) return [];
  
  const wishlistItems = await Wishlist.find({ 
    $or: [
      { userId: user._id },
      { userEmail: email }
    ]
  }).populate('productId');
  
  return wishlistItems;
}

/**
 * Add product to user's wishlist
 */
export async function addToWishlist(userEmail: string, productId: string) {
  await connectToDB();
  
  const user = await findOrCreateUser(userEmail);
  
  // Check if already in wishlist
  const existing = await Wishlist.findOne({
    userId: user._id,
    productId: productId
  });
  
  if (existing) {
    return { success: false, message: "Already in wishlist" };
  }
  
  const wishlistItem = await Wishlist.create({
    userId: user._id,
    userEmail: userEmail,
    productId: productId,
  });
  
  return { success: true, data: wishlistItem };
}

/**
 * Remove product from wishlist
 */
export async function removeFromWishlist(userEmail: string, productId: string) {
  await connectToDB();
  
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    return { success: false, message: "User not found" };
  }
  
  const deleted = await Wishlist.findOneAndDelete({
    $or: [
      { userId: user._id, productId: productId },
      { userEmail: userEmail, productId: productId }
    ]
  });
  
  if (!deleted) {
    return { success: false, message: "Item not found in wishlist" };
  }
  
  return { success: true, data: deleted };
}

/**
 * Search products by title
 */
export async function searchProducts(searchText: string, limit: number = 20, promoted: boolean = false) {
  await connectToDB();
  
  const query: any = {
    title: { $regex: searchText, $options: 'i' }
  };
  
  if (promoted) {
    query.isPromoted = true;
  }
  
  return await Product.find(query)
    .limit(limit)
    .sort({ createdAt: -1 });
}

/**
 * Get products with active price alerts
 */
export async function getProductsWithAlerts() {
  await connectToDB();
  
  return await Product.find({
    'users.0': { $exists: true } // Has at least one subscriber
  });
}

/**
 * Promote a product (mark as trending)
 */
export async function promoteProduct(productId: string, userEmail: string, about?: string) {
  await connectToDB();
  
  const user = await findOrCreateUser(userEmail, undefined, 'promoter');
  
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      isPromoted: true,
      promotedBy: userEmail,
      promotedAt: new Date(),
      about: about,
    },
    { new: true }
  );
  
  return product;
}

/**
 * Unpromote a product
 */
export async function unpromoteProduct(productId: string) {
  await connectToDB();
  
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      isPromoted: false,
      promotedBy: null,
      promotedAt: null,
    },
    { new: true }
  );
  
  return product;
}
