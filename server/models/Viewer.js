import mongoose from 'mongoose';

const viewerSchema = new mongoose.Schema({
  viewerKey: { type: String, required: true, unique: true, minlength: 16, maxlength: 128 },
  displayName: { type: String, trim: true, maxlength: 50, default: 'Reader' },
}, { timestamps: true });

export default mongoose.model('Viewer', viewerSchema);
