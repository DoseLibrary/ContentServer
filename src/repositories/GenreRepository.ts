import { AppDataSource } from "../DataSource";
import { Genre } from "../models/Genre";
import { DeepPartial } from "typeorm";

export const GenreRepository = AppDataSource.getRepository(Genre).extend({
  async createIfNotExist(data: DeepPartial<Genre>) {
    const genre = await this.findOneBy({ name: data.name });
    if (!genre) {
      return this.create(data);
    }
    return genre;
  },
});
