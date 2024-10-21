import express from 'express';
import { configureRoutes } from './api';
import { configureMiddleware } from './middleware';

const Main = async () => {
  // Establish connection to the database
  //   await connect().then(() => {
  //     console.log('\nConnected to the database 🙂 ✅');
  //   });

  const app = express();

  configureMiddleware(app);

  configureRoutes(app);

  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`---\nServer running at http://localhost:${port} 🚀`);
  });
};

Main().catch((err) => {
  console.error(err);
  process.exit(1);
});
