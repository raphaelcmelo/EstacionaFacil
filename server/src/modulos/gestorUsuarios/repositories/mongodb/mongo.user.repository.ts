import { User, UserModel } from "../models/user.model";
import { UserInput, UserRepository } from "../ports/user.repository";

export class MongoUserRepository implements UserRepository {
  async create(userInput: UserInput): Promise<User> {
    const user = await UserModel.create(userInput);
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await UserModel.find();
    return users;
  }

  async findByCpf(cpf: string): Promise<User | null> {
    const user = await UserModel.findOne({ cpf });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user;
  }
}
