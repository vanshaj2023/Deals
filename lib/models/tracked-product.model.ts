import mongoose from 'mongoose';

const trackedProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  targetPrice: { type: Number, default: null },
  thresholdPercent: { type: Number, default: null },
  channelOverride: { type: String, enum: ['email', 'telegram', 'whatsapp', null], default: null },
  paused: { type: Boolean, default: false },
  lastAlertAt: { type: Date, default: null },
}, { timestamps: true });

trackedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });
trackedProductSchema.index({ productId: 1 });

const TrackedProduct = mongoose.models.TrackedProduct || mongoose.model('TrackedProduct', trackedProductSchema);

export default TrackedProduct;
