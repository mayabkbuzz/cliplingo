import { Router } from 'express';
import multer from 'multer';
import Clip from '../models/Clip.js';
import Submission from '../models/Submission.js';
import { transcribeAudio } from '../services/transcribe.js';
import { getFeedback } from '../services/feedback.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/feedback  (multipart/form-data)
// fields: userId, clipId, text (optional), audio (optional file)
router.post('/', upload.single('audio'), async (req, res, next) => {
  try {
    const { userId, clipId } = req.body;
    let { text } = req.body;
    if (!userId || !clipId) return res.status(400).json({ error: 'userId and clipId are required' });

    const clip = await Clip.findById(clipId);
    if (!clip) return res.status(404).json({ error: 'Clip not found' });

    const inputType = req.file ? 'voice' : 'text';
    if (req.file) text = await transcribeAudio(req.file.buffer, req.file.originalname || 'audio.webm');
    if (!text || !text.trim()) return res.status(400).json({ error: 'No text or speech detected' });

    const fb = await getFeedback({ text: text.trim(), clipTitle: clip.title, inputType });
    const saved = await Submission.create({ userId, clipId, inputType, text: text.trim(), ...fb });
    res.json(saved);
  } catch (e) {
    next(e);
  }
});

export default router;
