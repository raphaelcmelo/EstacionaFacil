import { Moment } from "moment";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import {
  User,
  UserModel,
} from "../modulos/gestorUsuarios/repositories/models/user.model";
import { env } from "./config";
import { tokenTypes } from "./tokens";
import { MongoUserRepository } from "../modulos/gestorUsuarios/repositories/mongodb/mongo.user.repository";
import { GetMeUseCase } from "../modulos/gestorUsuarios/use-cases/user/getMe";

type JwtPayload = {
  sub: string;
  iat: Moment;
  exp: Moment;
  type: string;
};

const jwtOptions = {
  secretOrKey: env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const userRepository = new MongoUserRepository();
const getMeUseCase = new GetMeUseCase(userRepository);

const jwtVerify = async (payload: JwtPayload, done: any) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error("Invalid token type");
    }
    const user = await getMeUseCase.execute(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
