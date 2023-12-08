import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from '../../../lib/repository';
import { MovieResponse } from '../types/MovieResponse';
import { MovieOrderBy, MovieOrderByOptions, listMoviesByGenreWithMetadata, normalizeMovies } from '../../../lib/queries/movieQueries';

interface Query {
  orderBy: MovieOrderBy;
  limit: number;
  offset: number;
}

interface Param {
  genre: string;
}

export class ListMoviesByGenreEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list/genre/:genre', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').default('addedDate').isIn(Object.values(MovieOrderBy)),
      query('limit').default(50).isInt({ min: 0 }).toInt(),
      query('offset').default(0).isInt({ min: 0 }).toInt(),
      param('genre').isString()
    ]
  }
  protected async execute(data: RequestData<unknown, Query, Param>): Promise<MovieResponse[]> {
    const { genre } = data.params;
    const { limit, offset } = data.query;
    const orderBy: MovieOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const movies = await listMoviesByGenreWithMetadata(this.repository, genre, orderBy, limit, offset);
    return normalizeMovies(movies);
  }
}