import jwt from "jsonwebtoken";
import moment, { Moment } from "moment";
import { env } from "../../../../config/config";

export class GenerateTokenUseCase {
  async execute(userId: string, expires: Moment, type: string) {
    const secret = env.JWT_SECRET;

    const payload = {
      sub: userId,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  }
}
