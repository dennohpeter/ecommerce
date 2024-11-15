import { Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { v4 } from 'uuid';
import { query } from '../db';
import { validateToken, validationResult } from '../middleware';

const router = Router();
// Get comments by product id
router.get(
  '/',
  [check('product_id', 'Invalid product id').isUUID()],
  validationResult,
  async (req: Request, res: Response) => {
    const { product_id } = req.query;

    try {
      const { rows: comments } = await query(
        'SELECT * FROM comment WHERE product_id = $1',
        [product_id],
      );

      res.json({ data: { comments }, success: true });
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to fetch comments' },
        success: false,
      });
    }
  },
);

// Create a comment
router.post(
  '/',
  [
    check('product_id', 'Product id is required').isUUID(),
    check('content', 'Content is required').not().isEmpty(),
  ],
  validationResult,
  validateToken,
  async (req: Request, res: Response) => {
    const user_id = req.user!.id;

    const { product_id, content } = req.body;

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
        data: { error: 'Failed to create comment' },
        success: false,
      });
      return;
    }

    try {
      const id = v4();

      await query(
        'INSERT INTO comment (id, product_id, user_id, content) VALUES ($1, $2, $3, $4)',
        [id, product_id, user_id, content],
      );

      res.json({
        data: { message: 'Comment created successfully' },
        success: true,
      });
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to create comment' },
        success: false,
      });
    }
  },
);

// Delete a comment
router.delete(
  '/:id',
  [check('id', 'Invalid comment id').isUUID()],
  validationResult,
  validateToken,
  async (req: Request, res: Response) => {
    const user_id = req.user!.id;
    const { id } = req.params;

    try {
      // Ensure that the user owns the comment
      await query('DELETE FROM comment WHERE id = $1 AND user_id = $2', [
        id,
        user_id,
      ]);

      res.json({
        data: { message: 'Comment deleted successfully' },
        success: true,
      });
    } catch (error) {
      console.error({ error });
      res.status(500).json({
        data: { error: 'Failed to delete comment' },
        success: false,
      });
    }
  },
);

module.exports = router;
