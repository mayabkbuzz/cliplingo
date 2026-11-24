import { Router } from 'express';
import Clip from '../models/Clip.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json(await Clip.find().lean());
  } catch (e) {
    next(e);
  }
});

export default router;
