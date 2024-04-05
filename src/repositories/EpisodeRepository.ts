import { AppDataSource } from "../DataSource";
import { Log } from "../lib/Logger";
import { Episode } from "../models/Episode";
import fs from 'fs';
import path from 'path';
import { NotFoundException } from "../exceptions/NotFoundException";
import { FindOneOptions } from "typeorm";

export const EpisodeRepository = AppDataSource.getRepository(Episode).extend({
  async getEpisodePath(showId: number, seasonNumber: number, episodeNumber: number) {
    const episode = await this.findOneByEpisodeInSeason(
      showId,
      seasonNumber,
      episodeNumber,
      {
        relations: ['season', 'season.show', 'season.show.library']
      }
    );
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return path.join(episode.season.show.library.path, episode.path);
  },
  async findOneByPath(filePath: string) {
    return this.findOneBy({
      path: filePath,
    });
  },
  async findOneByEpisodeInSeason(
    showId: number,
    seasonNumber: number,
    episodeNumber: number,
    options?: FindOneOptions<Episode>
  ) {
    return this.findOne({
      where: {
        episodeNumber,
        showId,
        seasonNumber
      },
      ...options,
    });
  },
  async sync() {
    const episodes = await this.find({relations: ['season', 'season.show', 'season.show.library']});
    const missing = episodes.filter(episode => !fs.existsSync(path.join(episode.season.show.library.path, episode.path)));
    await Promise.all(missing.map(episode => this.remove(episode)));
    missing.forEach(episode => Log.info(`Show ${episode.season.show.name} Season ${episode.season.seasonNumber} Episode ${episode.episodeNumber} was removed from the database`));
  }
});
