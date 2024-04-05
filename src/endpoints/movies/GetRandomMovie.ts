import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MovieRepository } from '../../repositories/MovieRepository';
import { normalizeDetailedMovie } from '../../lib/queries/movieQueries';
import { DetailedMovieResponse } from '../../types/movie/DetailedMovieResponse';

interface QueryParams {
  requireTrailer: boolean;
}

export class GetRandomMovieEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/random', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('requireTrailer').default(false).isBoolean().toBoolean()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<DetailedMovieResponse> {
    const movie = await this.getRandomMovie(data.query.requireTrailer);
    if (movie === null) {
      throw new NotFoundException('No movies with trailers found');
    }
    return normalizeDetailedMovie(movie);
  }

  private getRandomMovie(requireTrailer: boolean) {
    const queryBuilder = MovieRepository.createQueryBuilder('movie')
      .orderBy('RANDOM()')
      .limit(1)
      .leftJoinAndSelect('movie.metadata', 'metadata')
      .leftJoinAndSelect('metadata.genres', 'genres')
      .leftJoinAndSelect('metadata.images', 'images')
    if (requireTrailer) {
      queryBuilder.where('trailerPath IS NOT NULL')
    }
    return queryBuilder.getOne();
  }
}