import { Router } from 'express';
import * as SessionCtrl from '../controllers/session.controller';
import * as ChatCtrl from '../controllers/chat.controller';

const router = Router();

router.post('/session/init', SessionCtrl.initSession);
router.get('/session/:phoneId/status', SessionCtrl.getStatus);

router.get('/chats/:phoneId', ChatCtrl.getChats);
router.get('/messages/:phoneId/:chatId', ChatCtrl.getMessages);
router.post('/messages/send', ChatCtrl.sendMessage);

export default router;