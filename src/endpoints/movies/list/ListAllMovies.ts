import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { MovieOrderBy, MovieOrderByOptions, normalizeBasicMovies } from '../../../lib/queries/movieQueries';
import { MovieRepository } from '../../../repositories/MovieRepository';
import { BasicMovieResponse } from '../../../types/movie/BasicMovieResponse';

interface QueryParams {
  orderBy: MovieOrderBy;
  limit: number;
  offset: number;
}

export class ListAllMoviesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').default('addedDate').isIn(Object.values(MovieOrderBy)),
      query('limit').default(50).isInt({ min: 0 }).toInt(),
      query('offset').default(0).isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicMovieResponse[]> {
    const { limit, offset } = data.query;
    const orderBy: MovieOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const movies = await MovieRepository.find({
      order: {
        [orderBy.field]: orderBy.dir,
      },
      take: limit,
      skip: offset
    });
    return normalizeBasicMovies(movies);
  }
}