import mongoose from 'mongoose';

const clipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  durationSec: { type: Number, max: 15 },
});

export default mongoose.model('Clip', clipSchema);
