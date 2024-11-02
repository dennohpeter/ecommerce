import { Request, Response, Router } from 'express';
import { check, validationResult } from 'express-validator';
import { query } from '../db';

const router = Router();

router.get('/', async (_, res) => {
  const { rows: categories } = await query('SELECT * FROM categories', []);

  res.json({ data: { categories }, success: true });
});

router.get(
  '/:id',
  [check('id', 'Invalid category id').isUUID()],
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

    const { rows: product } = await query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id],
    );

    res.json({ data: { product }, success: true });
  },
);

module.exports = router;
