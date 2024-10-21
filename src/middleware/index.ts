import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';

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
