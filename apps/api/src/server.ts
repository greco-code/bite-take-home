import { app } from './app.js';

const port = Number.parseInt(process.env.PORT ?? '4000', 10);

const server = app.listen(port, () => {
  console.info(`Bite API listening on http://localhost:${port}`);
});

const shutdown = () => {
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
