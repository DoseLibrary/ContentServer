import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MovieRepository } from '../../repositories/MovieRepository';
import { DetailedMovieResponse } from '../../types/movie/DetailedMovieResponse';
import { normalizeDetailedMovie } from '../../lib/queries/movieQueries';

interface Param {
  id: number;
}

export class GetMovieInfoEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:id', emitter);
  }
  
  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<DetailedMovieResponse> {
    // TODO: Should return user data
    const movie = await MovieRepository.findOneById(data.params.id);
    if (movie === null) {
      throw new NotFoundException('Movie not found');
    }
    return normalizeDetailedMovie(movie);
  }
}