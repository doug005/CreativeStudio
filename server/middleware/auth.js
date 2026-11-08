import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireCreator(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Creator login is required.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('name email bio avatarUrl');
    if (!user) return res.status(401).json({ message: 'Creator account no longer exists.' });
    req.creator = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
}
