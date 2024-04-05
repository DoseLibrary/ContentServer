import { FindManyOptions, FindOneOptions, In, Like } from "typeorm";
import { AppDataSource } from "../DataSource";
import { Movie } from "../models/Movie";
import fs from 'fs';
import path from 'path';
import { Log } from "../lib/Logger";
import { NotFoundException } from "../exceptions/NotFoundException";

export const MovieRepository = AppDataSource.getRepository(Movie).extend({
  async getMoviePathById(movieId: number) {
    const movie = await this.findOneById(movieId, {
      relations: ['library']
    });
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return path.join(movie.library.path, movie.path);
  },
  async findByTitle(title: string, options?: FindManyOptions<Movie>) {
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
  async findOneById(id: number, options?: FindOneOptions<Movie>) {
    return this.findOne({
      where: {
        id
      },
      ...options,
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
  async findByExternalIds(externalIds: number[]) {
    return this.find({
      where: {
        metadata: {
          externalId: In(externalIds)
        }
      }
    });
  },
  async findPopular(limit: number, offset: number) {
    return this.find({
      order: {
        addedDate: 'DESC'
      },
      take: limit,
      skip: offset
    });
  },
  async sync() {
    const movies = await this.find({relations: ['library']});
    const missing = movies.filter(movie => !fs.existsSync(path.join(movie.library.path, movie.path)));
    await Promise.all(missing.map(movie => this.remove(movie)));
    missing.forEach(movie => Log.info(`Movie ${movie.name} was removed from the database`));
  }
})