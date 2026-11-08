import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  displayName: { type: String, required: true, trim: true, minlength: 3, maxlength: 30, validate: { validator: (value) => !/\p{N}/u.test(value) && value.trim().split(/\s+/u).length >= 2, message: 'Name must include a surname and cannot contain numbers.' } },
  message: { type: String, required: true, trim: true, minlength: 2, maxlength: 1000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Hidden'], default: 'Pending', index: true },
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
