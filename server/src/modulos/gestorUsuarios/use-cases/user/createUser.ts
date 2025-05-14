import status from "http-status";

import ApiError from "../../../../utils/ApiError";
import {
  UserInput,
  UserRepository,
} from "../../repositories/ports/user.repository";

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userInput: UserInput) {
    const userByCpf = await this.userRepository.findByCpf(userInput.cpf);
    if (userByCpf) {
      throw new ApiError(status.BAD_REQUEST, "CPF já cadastrado");
    }

    const userByEmail = await this.userRepository.findByEmail(userInput.email);
    if (userByEmail) {
      throw new ApiError(status.BAD_REQUEST, "E-mail já cadastrado");
    }

    const user = await this.userRepository.create(userInput);

    return user;
  }
}
