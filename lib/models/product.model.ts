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
  summary: { type: String },
  category: { type: String },
  reviewsCount: { type: Number },
  stars: { type: Number },
  isOutOfStock: { type: Boolean, default: false },
  source: { type: String, enum: ['amazon', 'myntra', 'flipkart'], default: 'amazon' },
}, { timestamps: true });

productSchema.index({ category: 1 });
productSchema.index({ discountRate: -1 });
productSchema.index({ source: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
