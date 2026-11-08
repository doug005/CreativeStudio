import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register } from '../controllers/authController.js';

const router = Router();
router.post('/login', login);
router.post('/register', rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many registration attempts. Please try again later.' } }), register);
export default router;
