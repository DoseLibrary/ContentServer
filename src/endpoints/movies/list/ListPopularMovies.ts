import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { normalizeBasicMovies } from '../../../lib/queries/movieQueries';
import { MovieRepository } from '../../../repositories/MovieRepository';
import { BasicMovieResponse } from '../../../types/movie/BasicMovieResponse';

enum OrderBy {
  ADDED_DATE = 'addedDate'
};

interface QueryParams {
  orderBy: OrderBy;
  limit: number;
  offset: number;
}

export class ListPopularMoviesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list/popular', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').isString().isIn(['addedDate', 'releaseDate']).default('addedDate'),
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicMovieResponse[]> {
    const movies = await MovieRepository.findPopular(data.query.limit, data.query.offset);
    return normalizeBasicMovies(movies);
  }
}