import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { DeleteEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { UserRepository } from '../../repositories/UserRepository';
import { NotFoundException } from '../../exceptions/NotFoundException';

interface QueryParams {
  id: number;
}

export class RemoveFromWatchlistEndpoint extends DeleteEndpoint {
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
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.watchlistMovies = user.watchlistMovies.filter(movie => movie.id !== movieId);
    await UserRepository.save(user);
  }
}