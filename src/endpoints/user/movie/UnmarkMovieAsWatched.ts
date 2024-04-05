import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { DeleteEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { NotFoundException } from "../../../exceptions/NotFoundException";
import { UserRepository } from "../../../repositories/UserRepository";

interface Param {
  id: number;
}

export class UnmarkMovieAsWatchedEndpoint extends DeleteEndpoint {
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
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.watchedMovies = user.watchedMovies.filter(movie => movie.id !== movieId);
    await UserRepository.save(user);
  }
}