import mongoose from 'mongoose';

const trackedProductSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',       required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',    default: null },
    scrapeJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScrapeJob', default: null },
    // 'pending' = scrape not yet done; 'active' = product is live
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'active',
    },
    // Store the URL while pending so we can show it in the UI
    pendingUrl: { type: String, default: null },
    targetPrice:      { type: Number, default: null },
    thresholdPercent: { type: Number, default: null },
    channelOverride: {
      type: String,
      enum: ['email', 'telegram', 'whatsapp', null],
      default: null,
    },
    paused:      { type: Boolean, default: false },
    lastAlertAt: { type: Date,    default: null },
  },
  { timestamps: true }
);

// Non-unique index for query performance — uniqueness enforced in app code.
trackedProductSchema.index({ userId: 1, productId: 1 });
trackedProductSchema.index({ productId: 1 });
trackedProductSchema.index({ scrapeJobId: 1 });

// In dev, hot reloads keep the mongoose singleton alive but re-execute module
// code, so mongoose.models.TrackedProduct holds the OLD compiled schema.
// Deleting it forces a re-compile with the current schema definition.
if (process.env.NODE_ENV !== 'production') {
  delete (mongoose.models as Record<string, unknown>).TrackedProduct;
}

const TrackedProduct =
  mongoose.models.TrackedProduct ||
  mongoose.model('TrackedProduct', trackedProductSchema);

export default TrackedProduct;
