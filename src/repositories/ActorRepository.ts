import { AppDataSource } from "../DataSource";
import { Actor } from "../models/Actor";
import { DeepPartial } from "typeorm";

export const ActorRepository = AppDataSource.getRepository(Actor).extend({
  async createIfNotExist(data: DeepPartial<Actor>) {
    const actor = await this.findOneBy({ id: data.id });
    if (!actor) {
      return this.create(data);
    }
    return actor;
  },
});
