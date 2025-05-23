import { User } from "../models/user.model";

export type UserInput = {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  password: string;
};

export interface UserRepository {
  create(user: UserInput): Promise<User>;
  findAll(): Promise<User[]>;
  findByCpf(cpf: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
}
