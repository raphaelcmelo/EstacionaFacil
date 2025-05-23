import status from "http-status";

import ApiError from "../../../../utils/ApiError";
import { UserRepository } from "../../repositories/ports/user.repository";

export class GetAllUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute() {
    const getAllUsers = await this.userRepository.findAll();
    if (!getAllUsers) {
      throw new ApiError(status.BAD_REQUEST, "Nenhum usuário encontrado");
    }
    return getAllUsers;
  }
}
