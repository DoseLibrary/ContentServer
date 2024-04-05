import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { getUserWatchlist, getWatchedMovies, listOngoingMovies } from "../../../lib/queries/userQueries";
import { UserOngoingMovieRepository } from "../../../repositories/UserOngoingMovieRepository";
import { UserRepository } from "../../../repositories/UserRepository";
import { NotFoundException } from "../../../exceptions/NotFoundException";

interface Param {
  id: number;
}

export class GetUserMovieData extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<unknown> {
    const user = await UserRepository.findOneById(data.userId, {
      relations: ['watchlistMovies', 'watchedMovies']
    });
    const entity = await UserOngoingMovieRepository.findOngoingMovieByUserIdAndMovieId(data.userId, data.params.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const inWatchlist = user.watchlistMovies.some(movie => movie.id === data.params.id);
    const watched = user.watchedMovies.some(movie => movie.id === data.params.id);

    return {
      lastWatched: entity?.lastWatched,
      timeWatched: entity?.time,
      inWatchlist,
      watched,
    }
  }

}