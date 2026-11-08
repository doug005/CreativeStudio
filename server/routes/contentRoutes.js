import { Router } from 'express';
import { requireCreator } from '../middleware/auth.js';
import { createContent, deleteContent, getPublic, listManaged, listPublic, recordView, updateContent } from '../controllers/contentController.js';

const router = Router();
router.get('/', listPublic);
router.get('/manage', requireCreator, listManaged);
router.post('/', requireCreator, createContent);
router.get('/:id', getPublic);
router.post('/:id/view', recordView);
router.put('/:id', requireCreator, updateContent);
router.delete('/:id', requireCreator, deleteContent);
export default router;
