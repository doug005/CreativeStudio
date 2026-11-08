import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import creatorRoutes from './routes/creatorRoutes.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((origin) => origin.trim());
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
} }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CreativeStudio API' }));
app.use('/api/auth', authRoutes);
app.use('/api/contents', contentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/creator', creatorRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
