import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { PostEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { NotFoundException } from "../../../exceptions/NotFoundException";
import { UserRepository } from "../../../repositories/UserRepository";
import { MovieRepository } from "../../../repositories/MovieRepository";

interface Param {
  id: number;
}

export class MarkMovieAsWatchedEndpoint extends PostEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id/watched', emitter);
  }


  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<void> {
    const { id: movieId } = data.params;
    const user = await UserRepository.findOneById(data.userId, {
      relations: ['watchedMovies']
    });
    const movie = await MovieRepository.findOneById(movieId);
    if (!user || !movie) {
      throw new NotFoundException('User or movie not found');
    }
    user.watchedMovies = [...user.watchedMovies, movie]
      .filter((movie, idx, arr) => arr.findIndex(m => m.id === movie.id) === idx);
    await UserRepository.save(user);
  }
}