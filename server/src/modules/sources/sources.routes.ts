import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../middleware/validate.middleware';
import { uploadSingle } from '../../middleware/upload.middleware';
import { aiQuota } from '../../middleware/aiQuota.middleware';
import { createTextSchema, createUrlSchema } from './sources.schema';
import {
  uploadSource,
  createTextSource,
  createUrlSource,
  getSources,
  getSourceById,
  removeSource,
} from './sources.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getSources);
router.get('/:id', getSourceById);
router.post('/upload', uploadSingle, aiQuota, uploadSource);
router.post('/text', validateBody(createTextSchema), aiQuota, createTextSource);
router.post('/url', validateBody(createUrlSchema), aiQuota, createUrlSource);
router.delete('/:id', removeSource);

export default router;
