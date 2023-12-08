import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import { MovieResponse } from '../movies/types/MovieResponse';
import { getMovieRecommendations, normalizeMovie } from '../../lib/queries/movieQueries';

interface Param {
  id: number;
}

export class GetMovieRecommendationsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/recommended', emitter, repository);
  }
  
  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<MovieResponse[]> {
    const movies = await getMovieRecommendations(this.repository, data.params.id);
    return movies.map(normalizeMovie);
  }
}