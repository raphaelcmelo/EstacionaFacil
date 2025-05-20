import { TokenRepository } from "../../repositories/ports/token.repository";
import { Types } from "mongoose";

export class LogoutUseCase {
  constructor(private tokenRepository: TokenRepository) {}

  async execute(userId: Types.ObjectId): Promise<void> {
    await this.tokenRepository.deleteByUserId(userId);
  }
}
