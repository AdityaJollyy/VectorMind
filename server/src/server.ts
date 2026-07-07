import { createApp } from './app';
import { connectDB, disconnectDB } from './db/connect';
import { ensureCollection } from './lib/vector/qdrant';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  await connectDB();
  await ensureCollection();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running at http://localhost:${env.PORT} (${env.NODE_ENV})`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      logger.info('HTTP server and database connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
