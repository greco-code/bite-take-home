import { apiConfig, app } from './index.js';

const server = app.listen(apiConfig.port, () => {
  console.info(`Bite API listening on http://localhost:${apiConfig.port}`);
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
