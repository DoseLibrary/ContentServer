import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from '../../lib/repository';
import { MovieResponse } from '../movies/types/MovieResponse';
import { getUserWatchlist } from '../../lib/queries/userQueries';
import { normalizeMovies } from '../../lib/queries/movieQueries';

interface QueryParams {
  limit: number;
  offset: number;
}

export class GetMovieWatchlist extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/watchlist', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').isInt({ min: 0 }).optional().default(50),
      query('offset', 'How many records to skip').isInt({ min: 0 }).optional().default(0)
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<MovieResponse[]> {
    const movies = await getUserWatchlist(this.repository, data.userId, data.query.limit, data.query.offset);
    return normalizeMovies(movies);
  }
}