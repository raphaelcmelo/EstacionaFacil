import { Token, TokenModel } from "../models/token.model";
import { TokenInput, TokenRepository } from "../ports/token.repository";
import { Types } from "mongoose";

export class MongoTokenRepository implements TokenRepository {
  async create(tokenInput: TokenInput): Promise<Token> {
    const token = await TokenModel.create(tokenInput);
    return token;
  }

  async deleteByUserId(userId: Types.ObjectId): Promise<void> {
    await TokenModel.deleteMany({ userId });
  }
}
