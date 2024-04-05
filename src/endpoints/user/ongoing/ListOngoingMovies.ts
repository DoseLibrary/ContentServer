import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { normalizeBasicMovie } from '../../../lib/queries/movieQueries';
import { UserOngoingMovieRepository } from '../../../repositories/UserOngoingMovieRepository';
import { BasicMovieWithUserProgressResponse } from '../../../types/movie/BasicMovieResponse';
import { cleanDate } from '../../../util/date';

interface QueryParams {
  limit: number;
  offset: number;
}

export class ListOngoingMovies extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/ongoing/movies', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicMovieWithUserProgressResponse[]> {
    const entities = await UserOngoingMovieRepository.findOngoingMoviesByUserId(data.userId, {
      take: data.query.limit,
      skip: data.query.offset
    });
    return entities.map(entity => ({
      ...normalizeBasicMovie(entity.movie),
      progress: entity.time,
      lastWatched: cleanDate(entity.lastWatched),
    }));
  }
}