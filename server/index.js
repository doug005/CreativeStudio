import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { ensureDueContent } from './controllers/contentController.js';

const port = Number(process.env.PORT) || 5000;
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required. Set it in server/.env.');
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Production JWT_SECRET must contain at least 32 characters.');
}

try {
  await connectDatabase();
  await ensureDueContent();
  const scheduleTimer = setInterval(() => ensureDueContent().catch((error) => console.error('Scheduled publishing failed:', error.message)), 30_000);
  scheduleTimer.unref();
  app.listen(port, () => console.log(`CreativeStudio API listening on port ${port}`));
} catch (error) {
  console.error('Unable to start CreativeStudio API:', error.message);
  process.exit(1);
}
