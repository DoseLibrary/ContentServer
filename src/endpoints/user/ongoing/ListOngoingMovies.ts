import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from '../../../lib/repository';
import { MovieResponse } from '../../movies/types/MovieResponse';
import { listOngoingMovies } from '../../../lib/queries/userQueries';
import { normalizeMovies } from '../../../lib/queries/movieQueries';

interface QueryParams {
  limit: number;
  offset: number;
}

export class ListOngoingMovies extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/ongoing/movies', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<MovieResponse[]> {
    const movies = await listOngoingMovies(this.repository, data.userId, data.query.limit, data.query.offset);
    return normalizeMovies(movies);
  }
}