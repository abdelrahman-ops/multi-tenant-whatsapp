import { Client, RemoteAuth } from 'whatsapp-web.js';
import { MongoStoreAdapter } from './RemoteAuthStore';
import { WhatsAppNumber } from '../models/WhatsAppNumber';
import { redis } from '../lib/redis';
import { getIO } from './SocketService';
import { messageQueue } from '../queues/producers';
import QRCode from 'qrcode'; 

export class WWebJSAdapter {
  public client: Client;
  private phoneId: string;

  constructor(phoneId: string) {
    this.phoneId = phoneId;

    this.client = new Client({
      authStrategy: new RemoteAuth({
        clientId: phoneId,
        store: MongoStoreAdapter as any, // Type cast to satisfy strict wwebjs types
        backupSyncIntervalMs: 60000,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    });

    this.initializeEvents();
  }

  private initializeEvents() {
    this.client.on('qr', async (qrRaw) => {
        const qrImage = await QRCode.toDataURL(qrRaw);

      // 1. Store QR in DB/Redis for persistence if frontend reloads

      await WhatsAppNumber.updateOne({ phoneId: this.phoneId }, { qrCode: qrImage, status: 'QR_READY' });
      
      // 2. Emit Realtime
      getIO().emit(`qr:${this.phoneId}`, { qr: qrImage });
    });

    this.client.on('ready', async () => {
      console.log(`Client ${this.phoneId} is ready!`);
      await WhatsAppNumber.updateOne({ phoneId: this.phoneId }, { status: 'CONNECTED', qrCode: null });
      getIO().emit(`status:${this.phoneId}`, { status: 'CONNECTED' });
      
      // Initial Sync could go here (send to queue)
    });

    this.client.on('message', async (msg) => {
      // Offload processing immediately to BullMQ to keep the socket loop free
      await messageQueue.add('process-message', {
        phoneId: this.phoneId,
        message: msg
      });
    });

    this.client.on('disconnected', async (reason) => {
      console.log(`Client ${this.phoneId} disconnected: ${reason}`);
      await WhatsAppNumber.updateOne({ phoneId: this.phoneId }, { status: 'DISCONNECTED' });
      getIO().emit(`status:${this.phoneId}`, { status: 'DISCONNECTED' });
    });
  }

  public async start() {
    await this.client.initialize();
  }

  public async destroy() {
    await this.client.destroy();
  }
}