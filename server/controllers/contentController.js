import mongoose from 'mongoose';
import Content from '../models/Content.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';

const publicVisibility = () => ({ status: 'Published', publicationDate: { $lte: new Date() } });
const categories = ['Technology', 'Education', 'Entertainment', 'Lifestyle', 'Creativity'];
const types = ['Article', 'Video', 'Image', 'Podcast'];

export function contentInput(body) {
  const data = {};
  for (const key of ['title', 'description', 'category', 'type', 'thumbnailUrl', 'mediaUrl', 'articleBody']) {
    if (body[key] !== undefined) data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }
  for (const key of ['thumbnailUrl', 'mediaUrl']) {
    if (data[key]) {
      try {
        const url = new URL(data[key]);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        throw Object.assign(new Error(`${key === 'thumbnailUrl' ? 'Thumbnail' : 'Media'} URL must be a valid HTTP or HTTPS link.`), { status: 400 });
      }
    }
  }
  if (data.category && !categories.includes(data.category)) throw Object.assign(new Error('Choose a valid content category.'), { status: 400 });
  if (data.type && !types.includes(data.type)) throw Object.assign(new Error('Choose a valid content type.'), { status: 400 });
  if (body.status !== undefined) {
    if (!['Draft', 'Published', 'Scheduled'].includes(body.status)) throw Object.assign(new Error('Choose Draft, Published, or Scheduled.'), { status: 400 });
    data.status = body.status;
    if (body.status === 'Scheduled') {
      const date = new Date(body.publicationDate);
      if (!body.publicationDate || Number.isNaN(date.getTime()) || date <= new Date()) {
        throw Object.assign(new Error('Scheduled content needs a future publication date and time.'), { status: 400 });
      }
      data.publicationDate = date;
    } else if (body.status === 'Published') {
      data.publicationDate = body.publicationDate ? new Date(body.publicationDate) : new Date();
      if (Number.isNaN(data.publicationDate.getTime())) throw Object.assign(new Error('Publication date is invalid.'), { status: 400 });
      if (data.publicationDate > new Date()) throw Object.assign(new Error('Published content cannot have a future publication date.'), { status: 400 });
    } else data.publicationDate = null;
  } else if (body.publicationDate !== undefined) {
    const date = body.publicationDate ? new Date(body.publicationDate) : null;
    if (date && Number.isNaN(date.getTime())) throw Object.assign(new Error('Publication date is invalid.'), { status: 400 });
    data.publicationDate = date;
  }
  return data;
}

export async function listPublic(req, res, next) {
  try {
    const filter = publicVisibility();
    if (req.query.category && categories.includes(req.query.category)) filter.category = req.query.category;
    if (req.query.category && !categories.includes(req.query.category)) return res.status(400).json({ message: 'Unknown category.' });
    const search = String(req.query.search || '').trim().slice(0, 100);
    if (search) filter.$text = { $search: search };
    const items = await Content.find(filter).sort({ publicationDate: -1 }).limit(100).lean();
    const ids = items.map((item) => item._id);
    const [likes, comments] = await Promise.all([
      Like.aggregate([{ $match: { content: { $in: ids } } }, { $group: { _id: '$content', count: { $sum: 1 } } }]),
      Comment.aggregate([{ $match: { content: { $in: ids }, status: 'Approved' } }, { $group: { _id: '$content', count: { $sum: 1 } } }]),
    ]);
    const likeCounts = new Map(likes.map((entry) => [String(entry._id), entry.count]));
    const commentCounts = new Map(comments.map((entry) => [String(entry._id), entry.count]));
    res.json(items.map((item) => ({ ...item, likes: likeCounts.get(String(item._id)) || 0, commentCount: commentCounts.get(String(item._id)) || 0 })));
  } catch (error) { next(error); }
}

export async function getPublic(req, res, next) {
  try {
    const item = await Content.findOne({ _id: req.params.id, ...publicVisibility() }).lean();
    if (!item) return res.status(404).json({ message: 'Published content was not found.' });
    const [likes, commentCount] = await Promise.all([
      Like.countDocuments({ content: item._id }),
      Comment.countDocuments({ content: item._id, status: 'Approved' }),
    ]);
    res.json({ ...item, likes, commentCount });
  } catch (error) { next(error); }
}

export async function recordView(req, res, next) {
  try {
    const item = await Content.findOneAndUpdate({ _id: req.params.id, ...publicVisibility() }, { $inc: { views: 1 } }, { new: true }).select('views');
    if (!item) return res.status(404).json({ message: 'Published content was not found.' });
    res.json({ views: item.views });
  } catch (error) { next(error); }
}

export async function listManaged(req, res, next) {
  try {
    const items = await Content.find({ creator: req.creator.id }).sort({ updatedAt: -1 }).lean();
    const counts = await Like.aggregate([{ $match: { content: { $in: items.map((item) => item._id) } } }, { $group: { _id: '$content', count: { $sum: 1 } } }]);
    const countMap = new Map(counts.map((row) => [String(row._id), row.count]));
    res.json(items.map((item) => ({ ...item, likes: countMap.get(String(item._id)) || 0 })));
  } catch (error) { next(error); }
}

export async function createContent(req, res, next) {
  try {
    const data = contentInput(req.body);
    const item = await Content.create({ ...data, creator: req.creator.id });
    res.status(201).json(item);
  } catch (error) { next(error); }
}

export async function updateContent(req, res, next) {
  try {
    const data = contentInput(req.body);
    const item = await Content.findOneAndUpdate({ _id: req.params.id, creator: req.creator.id }, { $set: data }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Content was not found.' });
    res.json(item);
  } catch (error) { next(error); }
}

export async function deleteContent(req, res, next) {
  try {
    const item = await Content.findOneAndDelete({ _id: req.params.id, creator: req.creator.id });
    if (!item) return res.status(404).json({ message: 'Content was not found.' });
    await Promise.all([Comment.deleteMany({ content: item._id }), Like.deleteMany({ content: item._id })]);
    res.status(204).end();
  } catch (error) { next(error); }
}

export async function ensureDueContent() {
  await Content.updateMany({ status: 'Scheduled', publicationDate: { $lte: new Date() } }, { $set: { status: 'Published' } });
}

export function isValidObjectId(id) { return mongoose.isValidObjectId(id); }
