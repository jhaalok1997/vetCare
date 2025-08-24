import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("❌ Please define the MONGODB_URI in .env");
}

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// 🔹 Global caching to prevent multiple connections in dev
let cached: CachedMongoose = (global as { mongoose?: CachedMongoose }).mongoose || { conn: null, promise: null };

if (!cached) {
  cached = (global as { mongoose?: CachedMongoose }).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      const opts = {
        bufferCommands: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('✅ MongoDB connected successfully');
          return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}
