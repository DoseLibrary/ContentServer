import { FindManyOptions } from "typeorm";
import { AppDataSource } from "../DataSource";
import { UserOngoingMovie } from "../models/UserOngoingMovie";

export const UserOngoingMovieRepository = AppDataSource.getRepository(UserOngoingMovie).extend({
  async findOngoingMoviesByUserId(userId: number, options?: FindManyOptions<UserOngoingMovie>) {
    return this.find({
      where: {
        user: {
          id: userId
        }
      },
      ...options,
    });
  },
  async findOngoingMovieByUserIdAndMovieId(userId: number, movieId: number) {
    return this.findOne({
      where: {
        user: {
          id: userId
        },
        movie: {
          id: movieId
        }
      }
    });
  }
});