import status from "http-status";

import ApiError from "../../../../utils/ApiError";
import { UserRepository } from "../../repositories/ports/user.repository";
import { Password } from "./password";

export class LoginWithCpfAndPassword {
  constructor(private userRepository: UserRepository) {}

  async execute(cpf: string, password: string) {
    const userByCpf = await this.userRepository.findByCpf(cpf);
    if (!userByCpf) {
      throw new ApiError(status.UNAUTHORIZED, "Incorrect email or password");
    }

    const passwordsMatch = await Password.compare(userByCpf.password, password);
    if (!passwordsMatch) {
      throw new ApiError(status.UNAUTHORIZED, "Incorrect email or password");
    }

    return userByCpf;
  }
}
