import { Router } from 'express';
import { check } from 'express-validator';
import { query } from '../db';
import { validationResult } from '../middleware';
import { login, register } from '../services';

const router = Router();

router.get('/', async (_, res) => {
  const { rows: users } = await query('SELECT * FROM users', []);
  res.json({ data: { users }, success: true });
});

router.get('/:id', (req, res) => {
  res.send(`User ${req.params.id}`);
});

router.post(
  '/register',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .withMessage('Name must be at least 5 characters'),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
      .isLength({
        min: 6,
      })
      .withMessage('Password must be at least 6 characters'),

    check('role')
      .optional()
      .isIn(['admin', 'user'])
      .withMessage('Role must be either admin or user'),
  ],
  validationResult,
  register,
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
  ],
  validationResult,
  login,
);

module.exports = router;
