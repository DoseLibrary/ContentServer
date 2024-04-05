import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { normalizeBasicMovies } from '../../lib/queries/movieQueries';
import { MovieRepository } from '../../repositories/MovieRepository';
import { In } from 'typeorm';
import { BasicMovieResponse } from '../../types/movie/BasicMovieResponse';

interface Param {
  id: number;
}

export class GetMovieRecommendationsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:id/recommended', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<BasicMovieResponse[]> {
    type QueryResult = { movieId1: number, movieId2: number };
    const queryResult: QueryResult[] = await MovieRepository.query(
      'SELECT * FROM movie_metadata_recommendation WHERE movieId1 = ? OR movieId2 = ?',
      [data.params.id, data.params.id],
    );
    const recommendedIds = queryResult.map(row => row.movieId1 === data.params.id ? row.movieId2 : row.movieId1);

    const movies = await MovieRepository.findBy({
      id: In(recommendedIds)
    });
    return normalizeBasicMovies(movies);
  }
}