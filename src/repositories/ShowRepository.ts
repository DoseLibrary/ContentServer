import { FindManyOptions, Like } from "typeorm";
import { AppDataSource } from "../DataSource";
import { Log } from "../lib/Logger";
import { Show } from "../models/Show";
import fs from 'fs';
import path from 'path';

export const ShowRepository = AppDataSource.getRepository(Show).extend({
  async findByTitle(title: string, options?: FindManyOptions<Show>) {
    return this.find({
      where: [
        {
          name: Like(`%${title}%`)
        },
        {
          metadata: {
            title: Like(`%${title}%`)
          }
        }
      ],
      ...options
    });
  },
  async findOneByPathInLibrary(filePath: string, libraryId: number) {
    return this.findOneBy({
      path: filePath,
      library: {
        id: libraryId
      }
    });
  },
  async findByGenre(genre: string, options: FindManyOptions<Show>) {
    return this.find({
      where: {
        metadata: {
          genres: {
            name: genre
          }
        }
      },
      ...options
    });
  },
  async findById(id: number) {
    return this.findOneBy({
      id
    });
  },
  async sync() {
    const shows = await this.find({relations: ['library']});
    const missing = shows.filter(show => !fs.existsSync(path.join(show.library.path, show.path)));
    await Promise.all(missing.map(show => this.remove(show)));
    missing.forEach(show => Log.info(`Show ${show.name} was removed from the database`));
    
  },
});
