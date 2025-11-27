import IORedis from 'ioredis';
import { config } from '../config';

// Primary connection for caching and streams
export const redis = new IORedis(config.REDIS_URL);

// Subscriber connection for Pub/Sub (Redis requires dedicated connection for subs)
export const redisSub = new IORedis(config.REDIS_URL);