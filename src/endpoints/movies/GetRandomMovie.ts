import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from '../../lib/repository';
import { MovieResponse } from './types/MovieResponse';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { findMovieByIdWithMetadata, normalizeMovie } from '../../lib/queries/movieQueries';

interface QueryParams {
  requireTrailer: boolean;
}

export class GetRandomMovieEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/random', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('requireTrailer').default(false).isBoolean().toBoolean()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<MovieResponse> {
    const movies = await this.getMovies(data.query.requireTrailer);
    const randomId = movies[Math.floor(Math.random() * movies.length)]?.id;
    const movie = await findMovieByIdWithMetadata(this.repository, randomId);
    if (randomId === undefined || movie === null) {
      throw new NotFoundException('No movies with trailers found');
    }
    return normalizeMovie(movie);
  }

  private getMovies(requireTrailer: boolean) {
    if (requireTrailer) {
      return this.repository.movie.list({
        where: {
          NOT: {
            trailerPath: null
          }
        },
      });
    }
    return this.repository.movie.list();
  }
}