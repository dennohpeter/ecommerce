import { faker } from '@faker-js/faker';
import { Request, Response, Router } from 'express';
import { check } from 'express-validator';
import { v4 } from 'uuid';
import { query } from '../db';
import { validateAdmin, validateToken, validationResult } from '../middleware';

const router = Router();

// get all products or filter by price and category
router.get(
  '/',
  [
    check('price_gte', 'Price must be a number').optional().isNumeric(),
    check('price_lte', 'Price must be a number').optional().isNumeric(),
    check('category_id', 'Invalid category_id').optional().isUUID(),
  ],
  validationResult,
  async (req: Request, res: Response) => {
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

// get a single product
router.get(
  '/:id',
  [check('id', 'Invalid product id').isUUID()],
  validationResult,
  validateToken,
  async (req: Request, res: Response) => {
    try {
      const { id: product_id } = req.params;

      // get product and average rating
      const { rows: product } = await query(
        'SELECT products.*, CAST(AVG(rating.value) AS DECIMAL(10, 2)) as rating FROM products LEFT JOIN rating ON products.id = rating.product_id WHERE products.id = $1 \
        GROUP BY products.id',
        [product_id],
      );

      // get user rating
      const { rows: ratings } = await query(
        'SELECT value FROM rating WHERE product_id = $1 AND user_id = $2 LIMIT 1',
        [product_id, req.user!.id],
      );

      const { rows: comments } = await query(
        'SELECT * FROM comment WHERE product_id = $1',
        [product_id],
      );

      res.json({
        data: { product, user_rating: ratings[0]?.value || null, comments },
        success: true,
      });
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        data: { error: 'Failed to get product' },
        success: false,
      });
    }
  },
);

// create a new product
// FIX: id + as slug(from title) + category_id instead of uuid v4
router.post(
  '/',
  [
    check('title', 'Title is required')
      .not()
      .isEmpty()
      .isLength({ min: 3 })
      .withMessage('Title must be at least 5 characters'),
    check('picture').optional().isURL().withMessage('Invalid picture URL'),
    check('summary')
      .optional()
      .isString()
      .withMessage('Summary must be a string'),
    check('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    check('quantity')
      .optional()
      .isNumeric()
      .withMessage('Quantity must be a number'),
    check('price', 'Price is required')
      .not()
      .isEmpty()
      .isNumeric()
      .withMessage('Price must be a number'),
    check('category_id', 'Category Id is required')
      .not()
      .isEmpty()
      .isUUID()
      .withMessage('Invalid category_id'),
    check('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array of strings'),
  ],
  validationResult,
  validateToken,
  validateAdmin,
  async (req: Request, res: Response) => {
    let {
      title,
      picture,
      summary,
      description,
      quantity,
      price,
      category_id,
      tags,
    } = req.body;

    picture =
      picture || faker.image.urlPicsumPhotos({ width: 640, height: 480 });
    summary = summary || faker.commerce.productAdjective();
    description = description || faker.commerce.productDescription();
    quantity = quantity || faker.number.int({ min: 1, max: 100 });
    price = price || faker.commerce.price({ min: 1, max: 1000 });

    const { rows: category } = await query(
      'SELECT * FROM categories WHERE id = $1',
      [category_id],
    );

    try {
      if (category.length === 0) {
        res.status(400).json({
          data: { error: 'Invalid category_id' },
          success: false,
        });
        return;
      }
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        data: { error: 'Invalid category_id' },
        success: false,
      });
      return;
    }

    tags = tags || [faker.commerce.productMaterial()];

    const id = v4();

    try {
      const { rows: product } = await query(
        'INSERT INTO products (id, title, picture, summary, description, quantity, price, category_id, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [
          id,
          title,
          picture,
          summary,
          description,
          quantity,
          price,
          category_id,
          tags,
        ],
      );

      res.json({ data: { product }, success: true });
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        data: { error: 'Failed to create product' },
        success: false,
      });
    }
  },
);

// update a product
router.put(
  '/:id',
  [
    check('id', 'Invalid product id').isUUID(),
    check('title', 'Title is required')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Title must be at least 5 characters'),
    check('picture').optional().isURL().withMessage('Invalid picture URL'),
    check('summary')
      .optional()
      .isString()
      .withMessage('Summary must be a string'),
    check('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    check('quantity')
      .optional()
      .isNumeric()
      .withMessage('Quantity must be a number'),
    check('price', 'Price is required')
      .optional()
      .isNumeric()
      .withMessage('Price must be a number'),
    check('category_id', 'Category is required')
      .optional()
      .isUUID()
      .withMessage('Invalid category_id'),
    check('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array of strings'),
  ],
  validationResult,
  validateToken,
  validateAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    let {
      title,
      picture,
      summary,
      description,
      quantity,
      price,
      category_id,
      tags,
    } = req.body;

    if (category_id) {
      try {
        const { rows: category } = await query(
          'SELECT * FROM categories WHERE id = $1',
          [category_id],
        );

        if (category.length === 0) {
          res.status(400).json({
            data: { error: 'Invalid category_id' },
            success: false,
          });
          return;
        }
      } catch (error) {
        console.error({ error });
        res.status(400).json({
          data: { error: 'Invalid category_id' },
          success: false,
        });
        return;
      }
    }

    let update: Record<string, any> = {};

    if (title) update.title = title;
    if (picture) update.picture = picture;
    if (summary) update.summary = summary;
    if (description) update.description = description;
    if (quantity) update.quantity = quantity;
    if (price) update.price = price;
    if (category_id) update.category_id = category_id;
    if (tags) update.tags = tags;

    const updateCount = Object.keys(update).length;

    if (updateCount === 0) {
      res.status(400).json({
        data: { error: 'No fields to update' },
        success: false,
      });
      return;
    }

    try {
      const { rows: product } = await query(
        `UPDATE products SET ${Object.keys(update)
          .map((col, colIndex) => `${col} = $${colIndex + 1}`)
          .join(', ')} WHERE id = $${updateCount + 1} RETURNING *`,
        [...Object.values(update), id],
      );

      res.json({ data: { product }, success: true });
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        data: { error: 'Failed to update product' },
        success: false,
      });
    }
  },
);

// delete a product
router.delete(
  '/:id',
  [check('id', 'Invalid product id').isUUID()],
  validationResult,
  validateToken,
  validateAdmin,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const { rows: product } = await query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id],
      );

      res.json({ data: { product }, success: true });
    } catch (error) {
      console.error({ error });
      res.status(400).json({
        data: { error: 'Failed to delete product' },
        success: false,
      });
    }
  },
);

module.exports = router;
