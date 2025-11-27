import { Queue } from 'bullmq';
import { config } from '../config';

export const messageQueue = new Queue('incoming-message', {
  connection: { url: config.REDIS_URL }
});