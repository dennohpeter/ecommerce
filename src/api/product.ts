import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { query } from '../db';

const router = Router();

router.get(
  '/',
  [
    check('price_gte', 'Price must be a number').optional().isNumeric(),
    check('price_lte', 'Price must be a number').optional().isNumeric(),
    check('category_id', 'Invalid category_id').optional().isUUID(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      let errorMessages = errors.array().map((error) => error.msg);
      res.status(400).json({
        data: { error: errorMessages[0] },
        success: false,
      });
      return;
    }

    const { price_gte, price_lte, category_id } = req.query;

    let q = 'SELECT * FROM products WHERE 1 = 1';
    const params = [];
    let i = 1;

    if (price_gte) {
      q += ` AND price >= $${i}`;
      params.push(price_gte);
      i++;
    }

    if (price_lte) {
      q += ` AND price <= $${i}`;
      params.push(price_lte);
      i++;
    }

    if (category_id) {
      q += ` AND category_id = $${i}`;
      params.push(category_id);
      i++;
    }

    const { rows: products } = await query(q, params);

    res.json({ data: { products }, success: true });
  },
);

router.get('/:id', async (req, res) => {
  const { rows: product } = await query(
    'SELECT * FROM products WHERE id = $1',
    [req.params.id],
  );

  res.json({ data: { product }, success: true });
});

module.exports = router;
