import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from '../../../lib/repository';
import { ImageType } from '@prisma/client';
import { MovieResponse } from '../types/MovieResponse';
import { listPopularMoviesWithMetadata, normalizeMovies } from '../../../lib/queries/movieQueries';

enum OrderBy {
  ADDED_DATE = 'addedDate'
};

interface QueryParams {
  orderBy: OrderBy;
  limit: number;
  offset: number;
}

export class ListPopularMoviesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list/popular', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').isString().isIn(['addedDate', 'releaseDate']).default('addedDate'),
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<MovieResponse[]> {
    const movies = await listPopularMoviesWithMetadata(this.repository, data.query.limit, data.query.offset);
    return normalizeMovies(movies);
  }
}