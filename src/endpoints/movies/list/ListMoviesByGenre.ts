import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { MovieOrderBy, MovieOrderByOptions, normalizeBasicMovies } from '../../../lib/queries/movieQueries';
import { MovieRepository } from '../../../repositories/MovieRepository';
import { BasicMovieResponse } from '../../../types/movie/BasicMovieResponse';

interface Query {
  orderBy: MovieOrderBy;
  limit: number;
  offset: number;
}

interface Param {
  genre: string;
}

export class ListMoviesByGenreEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list/genre/:genre', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').default('addedDate').isIn(Object.values(MovieOrderBy)),
      query('limit').default(50).isInt({ min: 0 }).toInt(),
      query('offset').default(0).isInt({ min: 0 }).toInt(),
      param('genre').isString()
    ]
  }
  protected async execute(data: RequestData<unknown, Query, Param>): Promise<BasicMovieResponse[]> {
    const { genre } = data.params;
    const { limit, offset } = data.query;
    const orderBy: MovieOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const movies = await MovieRepository.find({
      where: {
        metadata: {
          genres: {
            name: genre
          }
        }
      },
      order: {
        [orderBy.field]: orderBy.dir
      },
      take: limit,
      skip: offset
    });

    return normalizeBasicMovies(movies);
  }
}