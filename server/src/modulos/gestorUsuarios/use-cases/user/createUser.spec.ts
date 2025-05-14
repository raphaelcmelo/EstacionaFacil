import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "../../repositories/in-memory/in-memory-user.repository";
import { UserInput } from "../../repositories/ports/user.repository";
import { CreateUserUseCase } from "./createUser";

let usersRepository: InMemoryUserRepository;
let createUserUseCase: CreateUserUseCase;

describe("Register Use Case", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUserRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("deveria criar corretamente um usuário válido", async () => {
    const userInput: UserInput = {
      name: faker.person.fullName(),
      socialName: faker.person.firstName(),
      cpf: cpf.generate(),
      email: faker.internet.email().toLowerCase(),
      password: "123456",
    };

    const user = await createUserUseCase.execute(userInput);

    expect(user.id).toEqual(expect.any(String));
    expect(user.createdAt).toEqual(expect.any(Date));
    expect(user.updatedAt).toEqual(expect.any(Date));
    expect(user).toBeDefined();
    expect(user).toMatchObject({
      name: userInput.name,
      socialName: userInput.socialName,
      cpf: userInput.cpf,
      email: userInput.email,
      role: "user",
      isEmailVerified: false,
    });
  });

  it("deveria lançar um erro 400 se CPF já existir", async () => {
    await createUserUseCase.execute({
      name: faker.person.fullName(),
      socialName: faker.person.firstName(),
      cpf: "22853138100",
      email: faker.internet.email().toLowerCase(),
      password: "123456",
    });

    const user2: UserInput = {
      name: faker.person.fullName(),
      socialName: faker.person.firstName(),
      cpf: "22853138100",
      email: faker.internet.email().toLowerCase(),
      password: "123456",
    };

    const resp = await expect(createUserUseCase.execute(user2)).rejects.toThrow(
      "CPF já cadastrado"
    );
  });

  it("deveria lançar um erro 400 se E-mail já existir", async () => {
    await createUserUseCase.execute({
      name: faker.person.fullName(),
      socialName: faker.person.firstName(),
      cpf: cpf.generate(),
      email: "test@test.com",
      password: "123456",
    });

    const user2: UserInput = {
      name: faker.person.fullName(),
      socialName: faker.person.firstName(),
      cpf: cpf.generate(),
      email: "test@test.com",
      password: "123456",
    };

    await expect(createUserUseCase.execute(user2)).rejects.toThrow(
      "E-mail já cadastrado"
    );
  });
});
