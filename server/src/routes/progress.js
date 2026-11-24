import { Router } from 'express';
import Submission from '../models/Submission.js';

const router = Router();

// GET /api/progress/:userId  -> stats + recurring mistakes
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const [recent, recurring, byCategory, total] = await Promise.all([
      Submission.find({ userId }).sort({ createdAt: -1 }).limit(20).select('score createdAt inputType').lean(),
      Submission.aggregate([
        { $match: { userId } },
        { $unwind: '$errors' },
        {
          $group: {
            _id: { category: '$errors.category', rule: '$errors.rule' },
            count: { $sum: 1 },
            lastExample: { $last: '$errors' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Submission.aggregate([
        { $match: { userId } },
        { $unwind: '$errors' },
        { $group: { _id: '$errors.category', count: { $sum: 1 } } },
      ]),
      Submission.countDocuments({ userId }),
    ]);

    const scores = recent.map((s) => s.score).filter((n) => typeof n === 'number');
    res.json({
      totalSubmissions: total,
      averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      scoreHistory: recent.reverse().map((s) => ({ score: s.score, date: s.createdAt })),
      recurringMistakes: recurring.map((r) => ({
        category: r._id.category,
        rule: r._id.rule || 'general',
        count: r.count,
        example: r.lastExample,
      })),
      byCategory: Object.fromEntries(byCategory.map((c) => [c._id, c.count])),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
