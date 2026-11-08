import Content from '../models/Content.js';
import Like from '../models/Like.js';
import Viewer from '../models/Viewer.js';

export async function likeContent(req, res, next) {
  try {
    const { contentId } = req.body;
    const viewerKey = String(req.body.viewerKey || '').trim();
    if (!contentId || viewerKey.length < 16 || viewerKey.length > 128) {
      return res.status(400).json({ message: 'A valid content ID and anonymous viewer key are required.' });
    }
    const content = await Content.findOne({ _id: contentId, status: 'Published', publicationDate: { $lte: new Date() } }).select('_id');
    if (!content) return res.status(404).json({ message: 'Published content was not found.' });
    await Viewer.updateOne({ viewerKey }, { $setOnInsert: { viewerKey, displayName: 'Reader' } }, { upsert: true });
    const result = await Like.updateOne({ content: content._id, viewerKey }, { $setOnInsert: { content: content._id, viewerKey } }, { upsert: true });
    const likes = await Like.countDocuments({ content: content._id });
    res.status(result.upsertedCount ? 201 : 200).json({ liked: true, likes });
  } catch (error) { next(error); }
}
