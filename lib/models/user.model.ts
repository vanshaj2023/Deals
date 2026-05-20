import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  emailVerified: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  notificationPrefs: {
    email: {
      enabled: { type: Boolean, default: true },
      address: { type: String, default: null },
    },
    telegram: {
      enabled: { type: Boolean, default: false },
      chatId: { type: String, default: null },
    },
    whatsapp: {
      enabled: { type: Boolean, default: false },
      phone: { type: String, default: null },
      verified: { type: Boolean, default: false },
    },
    defaultThresholdPercent: { type: Number, default: 5 },
  },
}, { timestamps: true });

userSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
