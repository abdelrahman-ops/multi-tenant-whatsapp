import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });
  console.log('✅ Socket.IO Initialized');
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};