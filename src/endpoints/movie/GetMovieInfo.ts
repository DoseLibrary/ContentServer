import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import { MovieResponse } from '../movies/types/MovieResponse';
import { findMovieByIdWithMetadata, normalizeMovie } from '../../lib/queries/movieQueries';
import { NotFoundException } from '../../exceptions/NotFoundException';

interface Param {
  id: number;
}

export class GetMovieInfoEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id', emitter, repository);
  }
  
  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<MovieResponse> {
    const movie = await findMovieByIdWithMetadata(this.repository, data.params.id);
    if (movie === null) {
      throw new NotFoundException('Movie not found');
    }
    return normalizeMovie(movie);
  }
}