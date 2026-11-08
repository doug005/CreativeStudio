import { Router } from 'express';
import { stats } from '../controllers/dashboardController.js';
import { requireCreator } from '../middleware/auth.js';

const router = Router();
router.get('/stats', requireCreator, stats);
export default router;
