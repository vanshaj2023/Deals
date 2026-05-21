import mongoose from 'mongoose';

const scrapeJobSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'done', 'failed'],
      default: 'pending',
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    error: { type: String, default: null },
    attemptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

scrapeJobSchema.index({ status: 1, createdAt: 1 });

const ScrapeJob =
  mongoose.models.ScrapeJob || mongoose.model('ScrapeJob', scrapeJobSchema);

export default ScrapeJob;
