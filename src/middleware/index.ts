import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import { validationResult as VR } from 'express-validator';
import { verify } from 'jsonwebtoken';
import { config } from '../config';

export const configureMiddleware = (app: Application) => {
  // Body parser
  app.use(express.json());

  // Form parser
  app.use(express.urlencoded({ extended: true }));

  // cookie parser
  app.use(cookieParser());

  // Enable CORS
  app.use(cors());
};

export const validateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    console.error('No token provided');
    res
      .status(401)
      .json({ data: { error: 'Unauthorized request!' }, success: false });
    return;
  }

  try {
    verify(token, config.jwtSecret, (err, decoded: any) => {
      if (err || !decoded) {
        console.error({ err, decoded });
        res.status(401).json({ msg: 'Unauthorized request!', success: false });
        return;
      }

      req.user = decoded?.user || decoded;
      next();
    });
  } catch (error) {
    console.error({ error });
    res
      .status(500)
      .json({ data: { msg: 'Internal server error' }, success: false });
  }
};

export const validateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === 'admin') {
    next();
  } else {
    res
      .status(403)
      .json({ data: { error: 'Unauthorized request!' }, success: false });
  }
};

export const validationResult = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = VR(req);

  if (!errors.isEmpty()) {
    let errorMessages = errors.array().map((error) => error.msg);
    res.status(400).json({
      data: { error: errorMessages[0] },
      success: false,
    });
    return;
  }

  next();
};
