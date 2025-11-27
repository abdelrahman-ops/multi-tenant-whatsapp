import http from 'http';
import app from './app';
import { config } from './config';
import { connectMongo } from './lib/mongo';
import { initSocket } from './services/SocketService';
import { clientManager } from './services/ClientManager';
import './queues/workers'; // Initialize workers

const start = async () => {
  await connectMongo();

  const server = http.createServer(app);
  initSocket(server);

  // Restore previous sessions from Mongo
  await clientManager.restoreSessions();

  server.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
  });
};

start();