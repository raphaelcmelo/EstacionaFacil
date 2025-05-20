import { Types } from "mongoose";
import { Token } from "../models/token.model";

export type TokenInput = {
  token: string;
  userId: Types.ObjectId;
  type: string;
  expires: Date;
  blacklisted: boolean;
};

export interface TokenRepository {
  create(tokenInput: TokenInput): Promise<Token>;
  deleteByUserId(userId: Types.ObjectId): Promise<void>;
}
