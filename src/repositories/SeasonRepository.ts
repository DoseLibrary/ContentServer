import { FindOneOptions } from "typeorm";
import { AppDataSource } from "../DataSource";
import { Log } from "../lib/Logger";
import { Season } from "../models/Season";
import fs from 'fs';
import path from 'path';

export const SeasonRepository = AppDataSource.getRepository(Season).extend({
  async findOneBySeasonInShow(showId: number, seasonNumber: number, options?: FindOneOptions<Season>) {
    return this.findOne({
      where: {
        seasonNumber,
        show: {
          id: showId
        },
      },
      ...options
    });
  },
  async sync() {
    const seasons = await this.find({relations: ['show', 'show.library']});
    const missing = seasons.filter(season => !fs.existsSync(path.join(season.show.library.path, season.path)));
    await Promise.all(missing.map(season => this.remove(season)));
    missing.forEach(season => Log.info(`Show ${season.show.name} Season ${season.seasonNumber} was removed from the database`));
  }
});
