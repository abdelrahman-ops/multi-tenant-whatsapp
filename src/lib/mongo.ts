import mongoose from 'mongoose';
import { config } from '../config';

export const connectMongo = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB Connection Error', error);
    process.exit(1);
  }
};