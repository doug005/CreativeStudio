import { Router } from 'express';
import { requireCreator } from '../middleware/auth.js';
import { listManagedComments, listPublicComments, moderateComment, submitComment } from '../controllers/commentController.js';

const router = Router();
router.post('/', submitComment);
router.get('/manage', requireCreator, listManagedComments);
router.get('/:contentId', listPublicComments);
router.patch('/:id/moderate', requireCreator, moderateComment);
export default router;
