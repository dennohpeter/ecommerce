import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (_, res) => {
  const { rows: products } = await query('SELECT * FROM products', []);

  res.json({ data: { products }, success: true });
});

router.get('/:id', async (req, res) => {
  const { rows: product } = await query('SELECT * FROM products WHERE id = ?', [
    req.params.id,
  ]);

  res.json({ data: { product }, success: true });
});

module.exports = router;
