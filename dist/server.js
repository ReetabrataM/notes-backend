"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const socket_1 = require("./socket");
const reminderJob_1 = require("./jobs/reminderJob");
async function bootstrap() {
    await (0, db_1.connectDB)();
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.port, () => {
        logger_1.logger.info(`Server running on port ${env_1.env.port} [${env_1.env.nodeEnv}]`);
    });
    (0, socket_1.initSocket)(server);
    logger_1.logger.info('Socket.IO initialized for real-time collaboration');
    (0, reminderJob_1.startReminderJob)();
    const shutdown = (signal) => {
        logger_1.logger.info(`${signal} received. Shutting down gracefully`);
        server.close(() => process.exit(0));
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}
bootstrap().catch((err) => {
    logger_1.logger.error('Failed to start server', { err });
    process.exit(1);
});
//# sourceMappingURL=server.js.map