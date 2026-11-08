import Content from '../models/Content.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';

export async function stats(req, res, next) {
  try {
    const creator = req.creator.id;
    const contents = await Content.find({ creator }).select('_id status views title thumbnailUrl category publicationDate').lean();
    const ids = contents.map((item) => item._id);
    const [comments, pendingComments, likes] = await Promise.all([
      Comment.countDocuments({ content: { $in: ids } }),
      Comment.countDocuments({ content: { $in: ids }, status: 'Pending' }),
      Like.aggregate([{ $match: { content: { $in: ids } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
    ]);
    const totalViews = contents.reduce((sum, item) => sum + item.views, 0);
    const popular = [...contents].sort((a, b) => b.views - a.views)[0] || null;
    res.json({
      totalContent: contents.length,
      published: contents.filter((item) => item.status === 'Published').length,
      drafts: contents.filter((item) => item.status === 'Draft').length,
      scheduled: contents.filter((item) => item.status === 'Scheduled').length,
      comments,
      pendingComments,
      views: totalViews,
      likes: likes[0]?.total || 0,
      popularContent: popular,
      recentContent: contents.sort((a, b) => new Date(b.updatedAt || b.publicationDate || 0) - new Date(a.updatedAt || a.publicationDate || 0)).slice(0, 5),
    });
  } catch (error) { next(error); }
}
