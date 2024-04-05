import { FindOneOptions } from "typeorm";
import { AppDataSource } from "../DataSource";
import { User } from "../models/User";

export const UserRepository = AppDataSource.getRepository(User).extend({
  async findOneById(id: number, options?: FindOneOptions<User>) {
    return this.findOne({
      where: {
        id
      },
      ...options,
    });
  },
  findOneByUsername(username: string) {
    return this.findOneBy({
      username
    });
  }
});