import { WWebJSAdapter } from './WWebJSAdapter';
import { WhatsAppNumber } from '../models/WhatsAppNumber';

class ClientManager {
  private clients: Map<string, WWebJSAdapter> = new Map();

  // Load all connected clients on server boot
  public async restoreSessions() {
    const numbers = await WhatsAppNumber.find({ status: { $ne: 'DISCONNECTED' } });
    for (const num of numbers) {
      console.log(`Restoring session for ${num.phoneId}...`);
      await this.startClient(num.phoneId);
    }
  }

  public async startClient(phoneId: string) {
    if (this.clients.has(phoneId)) return;

    const adapter = new WWebJSAdapter(phoneId);
    this.clients.set(phoneId, adapter);
    
    try {
      await adapter.start();
    } catch (e) {
      console.error(`Failed to start client ${phoneId}`, e);
      this.clients.delete(phoneId);
    }
  }

  public async stopClient(phoneId: string) {
    const adapter = this.clients.get(phoneId);
    if (adapter) {
      await adapter.destroy();
      this.clients.delete(phoneId);
      await WhatsAppNumber.updateOne({ phoneId }, { status: 'DISCONNECTED' });
    }
  }

  public getClient(phoneId: string) {
    return this.clients.get(phoneId)?.client;
  }
}

export const clientManager = new ClientManager();