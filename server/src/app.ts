import compression from "compression";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import status from "http-status";
import passport from "passport";
import { env } from "./config/config";
import { errorHandler, successHandler } from "./config/morgan";
import { jwtStrategy } from "./config/passport";
import { errorConverter } from "./middlewares/error";
import { authLimiter } from "./middlewares/rateLimiter";
import routes from "./routes/v1";
import ApiError from "./utils/ApiError";

const app = express();

if (env.NODE_ENV !== "test") {
  app.use(successHandler);
  app.use(errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(xss()); DEPRECATED
// app.use(mongoSanitize()); SÓ TEM PARA A VERSÃO 4.0

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
if (env.NODE_ENV === "production") {
  app.use("/v1/gestor-usuarios/auth", authLimiter);
}

// v1 api routes
app.use("/v1", routes);

// send back a 404 error for any unknown api request
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(status.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
