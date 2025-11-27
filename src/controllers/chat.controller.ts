import { Request, Response } from 'express';
import { redis } from '../lib/redis';
import { clientManager } from '../services/ClientManager';

export const getChats = async (req: Request, res: Response) => {
  const { phoneId } = req.params;
  const chats = await redis.hgetall(`wa:chats:${phoneId}`);
  // Parse JSON strings back to objects
  const parsed = Object.entries(chats).map(([chatId, data]) => ({
    chatId,
    ...JSON.parse(data)
  }));
  res.json(parsed);
};

export const getMessages = async (req: Request, res: Response) => {
  const { phoneId, chatId } = req.params;
  // Read from Redis Stream (Start -, End +)
  const streamData = await redis.xrange(`wa:stream:${phoneId}:${chatId}`, '-', '+');
  
  const messages = streamData.map(([id, fields]) => {
    // ioredis returns ['field', 'value', 'field', 'value']. We used 'payload'.
    const payloadStr = fields[1]; 
    return { streamId: id, ...JSON.parse(payloadStr) };
  });

  res.json(messages);
};

export const sendMessage = async (req: Request, res: Response) => {
  const { phoneId, chatId, message } = req.body;
  
  const client = clientManager.getClient(phoneId);
  if (!client) return res.status(404).json({ error: 'Client not active' });

  await client.sendMessage(chatId, message);
  res.json({ success: true });
};