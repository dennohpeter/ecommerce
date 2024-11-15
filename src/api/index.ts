import { Application } from 'express';

export const configureRoutes = (app: Application) => {
  app.use('/api/user', require('./user'));
  app.use('/api/product', require('./product'));
  app.use('/api/category', require('./category'));
  app.use('/api/comment', require('./comment'));
  app.use('/api/rating', require('./rating'));
  app.use('/api/status', (_, res) => {
    res.json({ data: { msg: 'Server is on fire! 🔥' }, success: true });
  });

  app.use((_, res) => {
    res.status(404).json({
      data: { msg: 'resource not found 🤔' },
      success: false,
    });
  });
};
