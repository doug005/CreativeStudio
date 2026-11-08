import { Router } from 'express';
import { likeContent } from '../controllers/likeController.js';

const router = Router();
router.post('/', likeContent);
export default router;
