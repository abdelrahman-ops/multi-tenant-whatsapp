import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppNumber extends Document {
  phoneId: string; // Unique identifier for the tenant/client
  companyId: string;
  sessionName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'STARTING';
  qrCode?: string;
}

const WhatsAppNumberSchema = new Schema({
  phoneId: { type: String, required: true, unique: true },
  companyId: { type: String, required: true },
  sessionName: { type: String, required: true },
  status: { type: String, default: 'DISCONNECTED' },
  qrCode: { type: String },
}, { timestamps: true });

export const WhatsAppNumber = mongoose.model<IWhatsAppNumber>('WhatsAppNumber', WhatsAppNumberSchema);