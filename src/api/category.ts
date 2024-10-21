import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (_, res) => {
  const { rows: categories } = await query('SELECT * FROM categories', []);

  res.json({ data: { categories }, success: true });
});

router.get('/:id', async (req, res) => {
  const { rows: product } = await query(
    'SELECT * FROM categories WHERE id = ?',
    [req.params.id],
  );

  res.json({ data: { product }, success: true });
});

module.exports = router;
