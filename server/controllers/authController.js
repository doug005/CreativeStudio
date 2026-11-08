import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function login(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 1 || password.length > 200) {
      return res.status(400).json({ message: 'Enter a valid email address and password.' });
    }
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    res.json({ token, creator: { id: user.id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl } });
  } catch (error) { next(error); }
}

export async function register(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const bio = String(req.body.bio || '').trim();
    if (name.length < 3 || name.length > 30) {
      return res.status(400).json({ message: 'Name must be between 3 and 30 characters.' });
    }
    if (/\p{N}/u.test(name)) return res.status(400).json({ message: 'Name cannot include numbers.' });
    if (name.split(/\s+/u).length < 2) return res.status(400).json({ message: 'Please include your surname.' });
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    if (password.length < 12 || password.length > 200) {
      return res.status(400).json({ message: 'Password must be between 12 and 200 characters.' });
    }
    if (bio.length > 500) {
      return res.status(400).json({ message: 'Bio must be 500 characters or fewer.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, ...(bio ? { bio } : {}) });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    res.status(201).json({ token, creator: { id: user.id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    next(error);
  }
}
