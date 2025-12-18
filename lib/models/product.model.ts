import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  currency: { type: String, required: true },
  image: { type: String, required: true },
  title: { type: String, required: true },
  currentPrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  priceHistory: [
    { 
      price: { type: Number, required: true },
      date: { type: Date, default: Date.now }
    },
  ],
  lowestPrice: { type: Number },
  highestPrice: { type: Number },
  averagePrice: { type: Number },
  discountRate: { type: Number },
  description: { type: String },
  category: { type: String },
  reviewsCount: { type: Number },
  isOutOfStock: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  users: [
    {email: { type: String, required: true}}
  ], default: [],
  
  // Product Type: "scraped" (from Amazon/bot) or "promoted" (manually added trending)
  productType: { 
    type: String, 
    enum: ['scraped', 'promoted'], 
    default: 'scraped',
    required: true 
  },
  
  // Trending/Promotion fields (replaces PostgreSQL trending table)
  isPromoted: { type: Boolean, default: false },
  promotedBy: { type: String }, // User email who promoted this
  promotedAt: { type: Date },
  about: { type: String }, // Additional info for promoted products
  link: { type: String }, // External link for promoted products
}, { timestamps: true });

// Indexes for better query performance
productSchema.index({ productType: 1 });
productSchema.index({ isPromoted: 1, promotedAt: -1 });
productSchema.index({ category: 1 });
productSchema.index({ discountRate: -1 });
productSchema.index({ promotedBy: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;