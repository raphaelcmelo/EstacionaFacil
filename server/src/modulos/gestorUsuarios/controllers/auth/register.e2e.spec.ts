import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";

import { afterAll, beforeAll, describe, it } from "vitest";
import { UserInput } from "../../repositories/ports/user.repository";

describe("Register (e2e)", () => {
  beforeAll(async () => {});

  afterAll(async () => {});

  it("deveria criar corretamente um usuário válido", async () => {
    const userInput: UserInput = {
      name: faker.person.fullName(),
      socialName: faker.person.firstName(),
      cpf: cpf.generate(),
      email: faker.internet.email().toLowerCase(),
      password: "aA@123456",
    };

    // const response = await request(app)
    //   .post("/v1/auth/register")
    //   .send(userInput);
    // console.log("🚀 ~ it ~ response:", response);

    // expect(response.statusCode).toEqual(201);
  });

  //deveria lançar um erro 400 se CPF for inválido
  //deveria lançar um erro 400 se email for invalido
});
