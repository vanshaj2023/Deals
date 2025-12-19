import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: false
  },
  image: { 
    type: String 
  },
  emailVerified: { 
    type: Date 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'promoter'], 
    default: 'user' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

userSchema.index({ email: 1 });

if (process.env.NODE_ENV === 'development') {
  userSchema.set('autoIndex', true);
}

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
