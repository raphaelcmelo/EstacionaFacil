import status from "http-status";

import ApiError from "../../../../utils/ApiError";
import { UserRepository } from "../../repositories/ports/user.repository";

export class GetMeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string) {
    const userByUserId = await this.userRepository.findById(userId);
    if (!userByUserId) {
      throw new ApiError(status.BAD_REQUEST, "ID não encontrado");
    }
    return userByUserId;
  }
}
