import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/wa_multi_tenant',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};