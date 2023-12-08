import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from '../../../lib/repository';
import { ImageType } from '@prisma/client';
import { MovieResponse } from '../types/MovieResponse';
import { MovieOrderBy, MovieOrderByOptions, listMoviesWithMetadata, normalizeMovies } from '../../../lib/queries/movieQueries';

interface QueryParams {
  orderBy: MovieOrderBy;
  limit: number;
  offset: number;
}

export class ListAllMoviesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').default('addedDate').isIn(Object.values(MovieOrderBy)),
      query('limit').default(50).isInt({ min: 0 }).toInt(),
      query('offset').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<MovieResponse[]> {
    const { limit, offset } = data.query;
    const orderBy: MovieOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const movies = await listMoviesWithMetadata(this.repository, orderBy, limit, offset);
    return normalizeMovies(movies);
  }
}