import { toFile } from 'openai';
import { openai } from './openai.js';

// Whisper speech-to-text. `buffer` comes from multer's memory storage.
export async function transcribeAudio(buffer, originalName = 'audio.webm') {
  const file = await toFile(buffer, originalName);
  const res = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
  });
  return res.text.trim();
}
