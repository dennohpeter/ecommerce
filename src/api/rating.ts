import { Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { v4 } from 'uuid';
import { query } from '../db';
import { validateToken, validationResult } from '../middleware';

const router = Router();
// Get ratings by product id
router.get(
  '/',
  [check('product_id', 'Invalid product id').isUUID()],
  validationResult,
  async (req: Request, res: Response) => {
    const { product_id } = req.query;

    try {
      const { rows: ratings } = await query(
        'SELECT * FROM rating WHERE product_id = $1',
        [product_id],
      );

      res.json({ data: { ratings }, success: true });
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to fetch ratings' },
        success: false,
      });
    }
  },
);

// Create a rating
router.post(
  '/',
  [
    check('product_id', 'Product id is required').isUUID(),
    check('value', 'Rating value is required')
      .not()
      .isEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating value must be between 1 and 5'),
  ],
  validationResult,
  validateToken,
  async (req: Request, res: Response) => {
    const user_id = req.user.id;

    const { product_id, value } = req.body;

    try {
      // check if product exists
      const { rows: products } = await query(
        'SELECT * FROM products WHERE id = $1',
        [product_id],
      );

      if (products.length === 0) {
        res.status(404).json({
          data: { error: 'Product no longer exists or has been removed' },
          success: false,
        });
        return;
      }
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to create rating' },
        success: false,
      });
      return;
    }

    try {
      const id = v4();
      // Check if the user has already rated the product
      const { rows: existingRating } = await query(
        'SELECT * FROM rating WHERE product_id = $1 AND user_id = $2',
        [product_id, user_id],
      );

      if (existingRating.length > 0) {
        // Update the existing rating
        await query(
          'UPDATE rating SET value = $1 WHERE product_id = $2 AND user_id = $3',
          [value, product_id, user_id],
        );

        res.json({
          data: { message: 'Rating updated successfully' },
          success: true,
        });

        return;
      }

      await query(
        'INSERT INTO rating (id, product_id, user_id, value) VALUES ($1, $2, $3, $4)',
        [id, product_id, user_id, value],
      );

      res.json({
        data: { message: 'Rating created successfully' },
        success: true,
      });
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to create rating' },
        success: false,
      });
    }
  },
);

// Delete a rating
router.delete(
  '/:id',
  [check('id', 'Invalid rating id').isUUID()],
  validationResult,
  validateToken,
  async (req: Request, res: Response) => {
    const user_id = req.user.id;
    const { id } = req.params;

    try {
      // Ensure that the user owns the rating
      await query('DELETE FROM rating WHERE id = $1 AND user_id = $2', [
        id,
        user_id,
      ]);

      res.json({
        data: { message: 'Rating deleted successfully' },
        success: true,
      });
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to delete rating' },
        success: false,
      });
    }
  },
);

module.exports = router;
