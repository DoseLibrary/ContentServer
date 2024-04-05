import { EventEmitter } from "events";
import { ValidationChain, param, query } from "express-validator";
import { PutEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { NotFoundException } from "../../../exceptions/NotFoundException";
import { UserOngoingMovieRepository } from "../../../repositories/UserOngoingMovieRepository";
import { MovieRepository } from "../../../repositories/MovieRepository";

interface Param {
  id: number;
}

interface Query {
  time: number;
}

export class UpdateMovieWatchtimeEndpoint extends PutEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id/watchtime', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      query('time').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, Query, Param>): Promise<void> {
    const { time } = data.query;
    const { id: movieId } = data.params;

    const entity = await UserOngoingMovieRepository.findOngoingMovieByUserIdAndMovieId(data.userId, movieId);

    // Not found, create a new one
    if (!entity) {
      const movieExists = await MovieRepository.existsBy({ id: movieId });
      if (!movieExists) {
        throw new NotFoundException('Movie not found');
      }
      await UserOngoingMovieRepository.save({
        userId: data.userId,
        movieId,
        time,
        lastWatched: new Date(),
      });
    }
    // Found, update the time
    else {
      entity.time = time;
      entity.lastWatched = new Date();
      await UserOngoingMovieRepository.save(entity);
    }
  }

}