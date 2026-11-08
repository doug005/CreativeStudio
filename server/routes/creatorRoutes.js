import { Router } from 'express';
import { getPublicCreator } from '../controllers/creatorController.js';

const router = Router();
router.get('/', getPublicCreator);
export default router;
