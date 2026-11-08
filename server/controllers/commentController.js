import Comment from '../models/Comment.js';
import Content from '../models/Content.js';

export async function submitComment(req, res, next) {
  try {
    const displayName = String(req.body.displayName || '').trim();
    const message = String(req.body.message || '').trim();
    const { contentId } = req.body;
    if (!displayName || displayName.length < 3 || displayName.length > 30) {
      return res.status(400).json({ message: 'Name must be between 3 and 30 characters.' });
    }
    if (/\p{N}/u.test(displayName)) return res.status(400).json({ message: 'Name cannot include numbers.' });
    if (displayName.split(/\s+/u).length < 2) return res.status(400).json({ message: 'Please include your surname.' });
    if (!contentId || message.length < 2 || message.length > 1000) {
      return res.status(400).json({ message: 'Comment must be between 2 and 1000 characters.' });
    }
    const content = await Content.findOne({ _id: contentId, status: 'Published', publicationDate: { $lte: new Date() } }).select('_id');
    if (!content) return res.status(404).json({ message: 'Published content was not found.' });
    const comment = await Comment.create({ content: content._id, displayName, message, status: 'Pending' });
    res.status(201).json({ message: 'Your comment is awaiting creator approval.', comment: { id: comment.id, status: comment.status } });
  } catch (error) { next(error); }
}

export async function listPublicComments(req, res, next) {
  try {
    const content = await Content.findOne({ _id: req.params.contentId, status: 'Published', publicationDate: { $lte: new Date() } }).select('_id');
    if (!content) return res.status(404).json({ message: 'Published content was not found.' });
    const comments = await Comment.find({ content: content._id, status: 'Approved' }).sort({ createdAt: -1 }).select('displayName message createdAt').limit(100).lean();
    res.json(comments);
  } catch (error) { next(error); }
}

export async function listManagedComments(req, res, next) {
  try {
    const contentIds = await Content.find({ creator: req.creator.id }).distinct('_id');
    const comments = await Comment.find({ content: { $in: contentIds } }).populate('content', 'title').sort({ createdAt: -1 }).limit(300);
    res.json(comments);
  } catch (error) { next(error); }
}

export async function moderateComment(req, res, next) {
  try {
    const { status, action } = req.body;
    if (action === 'delete') {
      const comment = await Comment.findById(req.params.id);
      if (!comment) return res.status(404).json({ message: 'Comment was not found.' });
      const belongs = await Content.exists({ _id: comment.content, creator: req.creator.id });
      if (!belongs) return res.status(404).json({ message: 'Comment was not found.' });
      await comment.deleteOne();
      return res.status(204).end();
    }
    const statusMap = { approve: 'Approved', hide: 'Hidden' };
    if (!statusMap[action] || (status && status !== statusMap[action])) return res.status(400).json({ message: 'Choose approve, hide, or delete.' });
    const managedIds = await Content.find({ creator: req.creator.id }).distinct('_id');
    const comment = await Comment.findOneAndUpdate({ _id: req.params.id, content: { $in: managedIds } }, { $set: { status: statusMap[action] } }, { new: true });
    if (!comment) return res.status(404).json({ message: 'Comment was not found.' });
    res.json(comment);
  } catch (error) { next(error); }
}
