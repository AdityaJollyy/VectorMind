import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { aiQuota } from '../../middleware/aiQuota.middleware';
import { chatMessageSchema } from './chat.schema';
import { chat, getMessages } from './chat.controller';

const router = Router();

router.use(requireAuth);

router.get('/:id/messages', getMessages);
router.post('/:id/chat', validateBody(chatMessageSchema), aiQuota, chat);

export default router;
