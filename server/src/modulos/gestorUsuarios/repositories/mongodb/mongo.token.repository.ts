import { Token, TokenModel } from "../models/token.model";
import { TokenInput, TokenRepository } from "../ports/token.repository";

export class MongoTokenRepository implements TokenRepository {
  async create(tokenInput: TokenInput): Promise<Token> {
    const token = await TokenModel.create(tokenInput);
    return token;
  }
}
