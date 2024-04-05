import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { PutEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from '../../exceptions/NotFoundException';
import { UserRepository } from '../../repositories/UserRepository';
import { MovieRepository } from '../../repositories/MovieRepository';

interface QueryParams {
  id: number;
}

export class AddToWatchlistEndpoint extends PutEndpoint {
  constructor(emitter: EventEmitter) {
    super('/watchlist', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<void> {
    const { id: movieId } = data.query;
    const user = await UserRepository.findOneById(data.userId, {
      relations: ['watchlistMovies']
    });
    const movie = await MovieRepository.findOneById(movieId);
    if (!user || !movie) {
      throw new NotFoundException('User or movie not found');
    }
    user.watchlistMovies.push(movie);
    await UserRepository.save(user);
  }
}