import { Store } from 'whatsapp-web.js';
import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  session: { type: String, required: true, unique: true }, // The phoneId
  file: { type: String, required: true }, // The filename (internal wwebjs)
  data: { type: Buffer, required: true }  // The file content
});

const SessionModel = mongoose.model('WwaSession', SessionSchema);

export class MongoStore implements Store {
  constructor(private options: { session: string }) {}

  async sessionExists(options: { session: string }): Promise<boolean> {
    const count = await SessionModel.countDocuments({ session: options.session });
    return count > 0;
  }

  async save(options: { session: string }): Promise<void> {
    // RemoteAuth saves internally, this method is often implicit but strictly required by interface
  }

  async extract(options: { session: string; path: string }): Promise<void> {
    const doc = await SessionModel.findOne({ session: options.session, file: options.path });
    if (!doc) {
        // Handle case where file doesn't exist (wwebjs handles clean start)
        return;
    }
    // Logic to return data is handled by 'read' usually, 
    // but RemoteAuth interface is slightly different.
    // See adapter implementation below for how we inject the strategy.
  }

  async delete(options: { session: string }): Promise<void> {
    await SessionModel.deleteMany({ session: options.session });
  }
}

// NOTE: whatsapp-web.js RemoteAuth expects a store object with specific methods.
// We expose a simplified adapter object for the Client configuration.
export const MongoStoreAdapter = {
    sessionExists: async (options: any) => {
        const doc = await SessionModel.findOne({ session: options.session });
        return !!doc;
    },
    save: async (options: any) => {
        await SessionModel.updateOne(
            { session: options.session, file: options.file },
            { data: options.data },
            { upsert: true }
        );
    },
    extract: async (options: any) => {
        const doc = await SessionModel.findOne({ session: options.session, file: options.file });
        return doc?.data; // Returns Buffer
    },
    delete: async (options: any) => {
        await SessionModel.deleteMany({ session: options.session });
    }
};