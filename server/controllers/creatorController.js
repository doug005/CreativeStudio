import User from '../models/User.js';

export async function getPublicCreator(_req, res, next) {
  try {
    const creator = await User.findOne().sort({ createdAt: 1 }).select('name bio avatarUrl');
    if (!creator) return res.status(404).json({ message: 'Creator profile is not available yet.' });
    res.json(creator);
  } catch (error) { next(error); }
}
