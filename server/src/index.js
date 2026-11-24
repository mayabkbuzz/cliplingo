import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import clipRoutes from './routes/clips.js';
import feedbackRoutes from './routes/feedback.js';
import progressRoutes from './routes/progress.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/clips', clipRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/progress', progressRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API running on :${port}`)))
  .catch((e) => {
    console.error('Mongo connection failed:', e.message);
    process.exit(1);
  });
