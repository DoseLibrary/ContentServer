import { FindManyOptions } from "typeorm";
import { AppDataSource } from "../DataSource";
import { UserOngoingEpisode } from "../models/UserOngoingEpisode";

export const UserOngoingEpisodeRepository = AppDataSource.getRepository(UserOngoingEpisode).extend({
  async findOngoingEpisodesByUserId(userId: number, options?: FindManyOptions<UserOngoingEpisode>) {
    return this.find({
      where: {
        user: {
          id: userId
        }
      },
      ...options,
    });
  },
  async findOngoingMovieByUserIdShowIdSeasonNumberEpisodeNumber(userId: number, showId: number, seasonNumber: number, episodeNumber: number) {
    return this.findOne({
      where: {
        user: {
          id: userId
        },
        episode: {
          showId,
          seasonNumber,
          episodeNumber
        }
      }
    });
  }
});