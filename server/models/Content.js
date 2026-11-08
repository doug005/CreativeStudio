import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 140 },
  description: { type: String, required: true, trim: true, minlength: 8, maxlength: 1200 },
  category: { type: String, required: true, enum: ['Technology', 'Education', 'Entertainment', 'Lifestyle', 'Creativity'] },
  type: { type: String, required: true, enum: ['Article', 'Video', 'Image', 'Podcast'] },
  thumbnailUrl: { type: String, default: '', trim: true, maxlength: 2048 },
  mediaUrl: { type: String, default: '', trim: true, maxlength: 2048 },
  articleBody: { type: String, default: '', maxlength: 50000 },
  status: { type: String, enum: ['Draft', 'Published', 'Scheduled'], default: 'Draft', index: true },
  publicationDate: { type: Date, default: null, index: true },
  views: { type: Number, default: 0, min: 0 },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });
contentSchema.index({ status: 1, publicationDate: -1 });
contentSchema.index({ title: 'text', description: 'text', category: 'text' });

export default mongoose.model('Content', contentSchema);
