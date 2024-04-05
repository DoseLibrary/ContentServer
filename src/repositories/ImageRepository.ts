import { AppDataSource } from "../DataSource";
import { Image } from "../models/Image";

export const ImageRepository = AppDataSource.getRepository(Image).extend({
  findOneById(id: number) {
    return this.findOneBy({
      id,
    });
  }
});