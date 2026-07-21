import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';
import { initSocket } from './socket';
import { startReminderJob } from './jobs/reminderJob';

async function bootstrap() {
  await connectDB();
  const app = createApp();

  const server = app.listen(env.port, () => {
    logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });

  initSocket(server);
  logger.info('Socket.IO initialized for real-time collaboration');
  startReminderJob();

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { err });
  process.exit(1);
});
