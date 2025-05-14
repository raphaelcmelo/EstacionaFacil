import { randomUUID } from "node:crypto";
import { Password } from "../../use-cases/auth/password";
import { UserInput, UserRepository } from "../ports/user.repository";

export class InMemoryUserRepository implements UserRepository {
  public items: any = [];

  async create(userInput: UserInput): Promise<any> {
    const passwordHashed = await Password.toHash(userInput.password);

    const user = {
      id: randomUUID(),
      name: userInput.name,
      socialName: userInput.socialName,
      cpf: userInput.cpf,
      email: userInput.email,
      password: passwordHashed,
      role: "user",
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(user);

    return user;
  }

  findByCpf(cpf: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const user = this.items.find((user: any) => user.cpf === cpf);
      resolve(user || null);
    });
  }

  findByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const user = this.items.find((user: any) => user.email === email);
      resolve(user || null);
    });
  }

  findById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const user = this.items.find((user: any) => user.id === id);
      resolve(user || null);
    });
  }
}
