"use strict";
/**
 * MongoDB Helper Functions
 * Common database queries and operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unpromoteProduct = exports.promoteProduct = exports.getProductsWithAlerts = exports.searchProducts = exports.removeFromWishlist = exports.addToWishlist = exports.getUserWishlist = exports.getProductsByPromoter = exports.getTrendingProducts = exports.findOrCreateUser = void 0;
const mongoose_1 = require("@/lib/mongoose");
const user_model_1 = __importDefault(require("@/lib/models/user.model"));
const product_model_1 = __importDefault(require("@/lib/models/product.model"));
const wishlist_model_1 = __importDefault(require("@/lib/models/wishlist.model"));
/**
 * Find or create a user by email
 */
async function findOrCreateUser(email, name, role = 'user') {
    await (0, mongoose_1.connectToDB)();
    let user = await user_model_1.default.findOne({ email });
    if (!user) {
        user = await user_model_1.default.create({
            email,
            name: name || email.split('@')[0],
            role,
        });
    }
    return user;
}
exports.findOrCreateUser = findOrCreateUser;
/**
 * Get all promoted/trending products
 */
async function getTrendingProducts(limit = 50) {
    await (0, mongoose_1.connectToDB)();
    return await product_model_1.default.find({ isPromoted: true })
        .sort({ promotedAt: -1 })
        .limit(limit);
}
exports.getTrendingProducts = getTrendingProducts;
/**
 * Get products by promoter email
 */
async function getProductsByPromoter(email) {
    await (0, mongoose_1.connectToDB)();
    return await product_model_1.default.find({
        isPromoted: true,
        promotedBy: email
    }).sort({ promotedAt: -1 });
}
exports.getProductsByPromoter = getProductsByPromoter;
/**
 * Get user's wishlist with populated products
 */
async function getUserWishlist(email) {
    await (0, mongoose_1.connectToDB)();
    const user = await user_model_1.default.findOne({ email });
    if (!user)
        return [];
    const wishlistItems = await wishlist_model_1.default.find({
        $or: [
            { userId: user._id },
            { userEmail: email }
        ]
    }).populate('productId');
    return wishlistItems;
}
exports.getUserWishlist = getUserWishlist;
/**
 * Add product to user's wishlist
 */
async function addToWishlist(userEmail, productId) {
    await (0, mongoose_1.connectToDB)();
    const user = await findOrCreateUser(userEmail);
    // Check if already in wishlist
    const existing = await wishlist_model_1.default.findOne({
        userId: user._id,
        productId: productId
    });
    if (existing) {
        return { success: false, message: "Already in wishlist" };
    }
    const wishlistItem = await wishlist_model_1.default.create({
        userId: user._id,
        userEmail: userEmail,
        productId: productId,
    });
    return { success: true, data: wishlistItem };
}
exports.addToWishlist = addToWishlist;
/**
 * Remove product from wishlist
 */
async function removeFromWishlist(userEmail, productId) {
    await (0, mongoose_1.connectToDB)();
    const user = await user_model_1.default.findOne({ email: userEmail });
    if (!user) {
        return { success: false, message: "User not found" };
    }
    const deleted = await wishlist_model_1.default.findOneAndDelete({
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
exports.removeFromWishlist = removeFromWishlist;
/**
 * Search products by title
 */
async function searchProducts(searchText, limit = 20, promoted = false) {
    await (0, mongoose_1.connectToDB)();
    const query = {
        title: { $regex: searchText, $options: 'i' }
    };
    if (promoted) {
        query.isPromoted = true;
    }
    return await product_model_1.default.find(query)
        .limit(limit)
        .sort({ createdAt: -1 });
}
exports.searchProducts = searchProducts;
/**
 * Get products with active price alerts
 */
async function getProductsWithAlerts() {
    await (0, mongoose_1.connectToDB)();
    return await product_model_1.default.find({
        'users.0': { $exists: true } // Has at least one subscriber
    });
}
exports.getProductsWithAlerts = getProductsWithAlerts;
/**
 * Promote a product (mark as trending)
 */
async function promoteProduct(productId, userEmail, about) {
    await (0, mongoose_1.connectToDB)();
    const user = await findOrCreateUser(userEmail, undefined, 'promoter');
    const product = await product_model_1.default.findByIdAndUpdate(productId, {
        isPromoted: true,
        promotedBy: userEmail,
        promotedAt: new Date(),
        about: about,
    }, { new: true });
    return product;
}
exports.promoteProduct = promoteProduct;
/**
 * Unpromote a product
 */
async function unpromoteProduct(productId) {
    await (0, mongoose_1.connectToDB)();
    const product = await product_model_1.default.findByIdAndUpdate(productId, {
        isPromoted: false,
        promotedBy: null,
        promotedAt: null,
    }, { new: true });
    return product;
}
exports.unpromoteProduct = unpromoteProduct;
