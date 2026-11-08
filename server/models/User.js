import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 30, validate: { validator: (value) => !/\p{N}/u.test(value) && value.trim().split(/\s+/u).length >= 2, message: 'Name must include a surname and cannot contain numbers.' } },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  bio: { type: String, default: 'Sharing ideas, stories, and things worth making.', maxlength: 500 },
  avatarUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
