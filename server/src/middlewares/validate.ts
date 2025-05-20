import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../utils/ApiError";

const validate =
  (schema: z.ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedObject = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });

      Object.assign(req, parsedObject);
      return next();
    } catch (error) {
      console.error("Validation error:", error);

      if (error instanceof z.ZodError) {
        const errorMessage = error.errors
          .map((details) => `${details.path.join(".")}: ${details.message}`)
          .join(", ");
        console.error("Validation error details:", errorMessage);
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      }

      return next(error);
    }
  };

export default validate;
