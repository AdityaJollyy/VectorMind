import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap() {
  // Database & vector-store connections will be added here in later steps.

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running at http://localhost:${env.PORT} (${env.NODE_ENV})`);
    logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
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
