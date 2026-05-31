import mongoose from 'mongoose';

let isConnected = false;
let indexesFixed = false;

export const connectToDB = async () => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  // Check actual mongoose state, not our cached flag (survives hot-reload)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    if (!indexesFixed) {
      indexesFixed = true;
      fixTrackedProductIndexes().catch((e) =>
        console.warn('[mongoose] index fix failed:', e)
      );
    }
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;

    if (!indexesFixed) {
      indexesFixed = true;
      fixTrackedProductIndexes().catch((e) =>
        console.warn('[mongoose] index fix failed:', e)
      );
    }
  } catch (error) {
    isConnected = false;
    console.error('[mongoose] connect FAILED:', error);
    throw error;
  }
}

async function fixTrackedProductIndexes() {
  try {
    const coll = mongoose.connection.collection('trackedproducts');
    const indexes = await coll.indexes();
    for (const idx of indexes) {
      if (idx.name === 'userId_1_productId_1' && idx.unique) {
        await coll.dropIndex('userId_1_productId_1');
        console.log('[mongoose] Dropped legacy unique index userId_1_productId_1');
      }
    }
  } catch (err) {
    console.warn('[mongoose] index fix skipped:', err);
  }
}
