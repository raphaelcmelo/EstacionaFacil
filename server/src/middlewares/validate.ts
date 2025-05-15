import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { z } from "zod";
import ApiError from "../utils/ApiError";

const validate =
  (schema: z.ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    try {
      const parsedObject = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      console.log(parsedObject);
      Object.assign(req, parsedObject);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log(error);
        const errorMessage = error.errors
          .map((details) => `${details.path.join(".")}: ${details.message}`)
          .join(", ");
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      }
      return next(error); // Passa outros erros para o próximo middleware
    }
  };

export default validate;
