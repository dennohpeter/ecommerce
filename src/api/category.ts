import { Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { query } from '../db';
import { validationResult } from '../middleware';

const router = Router();

router.get('/', async (_, res) => {
  const { rows: categories } = await query('SELECT * FROM categories', []);

  res.json({ data: { categories }, success: true });
});

router.get(
  '/:id',
  [check('id', 'Invalid category id').isUUID()],
  validationResult,
  async (req: Request, res: Response) => {
    const { rows: product } = await query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id],
    );

    res.json({ data: { product }, success: true });
  },
);

module.exports = router;
