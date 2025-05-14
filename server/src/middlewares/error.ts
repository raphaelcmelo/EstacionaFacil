import { NextFunction, Request, Response } from "express";
import status from "http-status";
import mongoose from "mongoose";
import { env } from "../config/config";
import { logger } from "../config/logger";
import ApiError from "../utils/ApiError";

export const errorConverter = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? status.BAD_REQUEST
        : status.INTERNAL_SERVER_ERROR;
    const message = error.message || status[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode, message } = err;
  if (env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = status[status.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(env.NODE_ENV === "dev" && { stack: err.stack }),
  };

  if (env.NODE_ENV === "dev") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
