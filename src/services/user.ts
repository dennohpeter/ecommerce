import { hash, verify } from 'argon2';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { query } from '../db';

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errorMessages = errors.array().map((error) => error.msg);
    res.status(400).json({
      data: { error: errorMessages[0] },
      success: false,
    });
    return;
  }

  const { name, email, password } = req.body;

  try {
    const id = uuidv4();

    const passwordHash = await hash(password);

    const { rows } = await query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
      [id, name, email, passwordHash],
    );

    console.log(rows);

    res.json({
      data: { msg: 'User created successfully' },
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      data: { error: 'Something went wrong' },
      success: false,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let errorMessages = errors.array().map((error) => error.msg);
    res.status(400).json({
      data: { error: errorMessages[0] },
      success: false,
    });
    return;
  }

  const { email, password } = req.body;

  try {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);

    if (rows.length === 0) {
      res.status(400).json({
        data: { error: 'Invalid credentials' },
        success: false,
      });
      return;
    }

    const user = rows[0];

    if (!(await verify(user.password, password))) {
      res.status(400).json({
        data: { error: 'Invalid credentials' },
        success: false,
      });
      return;
    }

    const payload = {
      user: {
        id: user.id,
        name: user.name,
      },
    };

    sign(payload, config.jwtSecret, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        res.status(500).json({
          data: { error: 'Something went wrong' },
          success: false,
        });
        return;
      }

      res.json({
        data: { token },
        success: true,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      data: { error: 'Something went wrong' },
      success: false,
    });
  }
};
