import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
  viewerKey: { type: String, required: true, minlength: 16, maxlength: 128 },
}, { timestamps: true });
likeSchema.index({ content: 1, viewerKey: 1 }, { unique: true });

export default mongoose.model('Like', likeSchema);
