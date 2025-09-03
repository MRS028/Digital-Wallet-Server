// db.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.DB_URL as string;

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the DB_URL environment variable inside Vercel.");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      connectTimeoutMS: 20000,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
