import http from "http";
import mongoose from "mongoose";
import { env } from "./config/config";
import { logger } from "./config/logger";

import app from "./app";

let server: http.Server;
mongoose.connect(env.MONGODB_URL).then(() => {
  logger.info("Connected to MongoDB");
  server = app.listen(env.PORT, () => {
    logger.info(`Listening to port ${env.PORT}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: string) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
