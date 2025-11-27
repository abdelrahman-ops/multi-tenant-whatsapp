import { Request, Response } from 'express';
import { WhatsAppNumber } from '../models/WhatsAppNumber';
import { clientManager } from '../services/ClientManager';
import { v4 as uuidv4 } from 'uuid';

export const initSession = async (req: Request, res: Response) => {
  const { companyId } = req.body;
  const phoneId = uuidv4(); // Generate a unique ID for this new number

  // Create DB Record
  await WhatsAppNumber.create({
    phoneId,
    companyId,
    sessionName: `session-${phoneId}`,
    status: 'STARTING'
  });

  // Start logic
  await clientManager.startClient(phoneId);

  res.json({ success: true, phoneId, message: 'Client initializing, listen to socket for QR' });
};

export const getStatus = async (req: Request, res: Response) => {
  const { phoneId } = req.params;
  const doc = await WhatsAppNumber.findOne({ phoneId });
  res.json({ status: doc?.status, qr: doc?.qrCode });
};