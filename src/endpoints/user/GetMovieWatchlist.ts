import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { UserRepository } from '../../repositories/UserRepository';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { normalizeBasicMovies } from '../../lib/queries/movieQueries';
import { BasicMovieResponse } from '../../types/movie/BasicMovieResponse';

interface QueryParams {
  limit: number;
  offset: number;
}

export class GetMovieWatchlist extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/watchlist', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').isInt({ min: 0 }).optional().default(50),
      query('offset', 'How many records to skip').isInt({ min: 0 }).optional().default(0)
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicMovieResponse[]> {
    const user = await UserRepository.findOneById(data.userId, {
      relations: ['watchlistMovies']
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return normalizeBasicMovies(user.watchlistMovies);
  }
}