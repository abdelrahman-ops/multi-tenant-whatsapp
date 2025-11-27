import { Worker } from 'bullmq';
import { config } from '../config';
import { redis } from '../lib/redis';
import { getIO } from '../services/SocketService';

// Worker: Process Incoming Messages
const messageWorker = new Worker('incoming-message', async (job) => {
  const { phoneId, message } = job.data;
  
  // 1. Normalize Message
  const streamKey = `wa:stream:${phoneId}:${message.from}`;
  const payload = {
    id: message.id._serialized,
    from: message.from,
    body: message.body,
    hasMedia: message.hasMedia,
    timestamp: message.timestamp.toString(),
    type: message.type
  };

  // 2. Add to Redis Stream (XADD)
  // Store as field-value pairs. 'data' field contains the JSON blob for flexibility.
  await redis.xadd(streamKey, '*', 'payload', JSON.stringify(payload));

  // 3. Update Chat List in Redis (Hash) - Last message preview
  const chatKey = `wa:chats:${phoneId}`;
  await redis.hset(chatKey, message.from, JSON.stringify({
    lastMessage: message.body,
    timestamp: message.timestamp,
    unreadCount: 1 // Logic to increment required in real prod
  }));

  // 4. Real-time emit to frontend
  getIO().to(`session:${phoneId}`).emit('new_message', { ...payload, chatId: message.from });

}, { connection: { url: config.REDIS_URL } });

messageWorker.on('completed', (job) => {
  console.log(`Msg processed: ${job.id}`);
});