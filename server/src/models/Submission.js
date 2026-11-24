import mongoose from 'mongoose';

const errorSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ['spelling', 'grammar', 'vocabulary', 'punctuation'], required: true },
    rule: String, // e.g. "subject-verb agreement", "articles", "past tense"
    original: String,
    correction: String,
    explanation: String,
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    clipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clip', required: true },
    inputType: { type: String, enum: ['text', 'voice'], required: true },
    text: { type: String, required: true }, // typed text or Whisper transcript
    correctedText: String,
    score: Number, // 0-100
    errors: [errorSchema],
    tip: String,
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
