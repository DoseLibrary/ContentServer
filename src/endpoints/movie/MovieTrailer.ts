import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint, ResponseType } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from '../../exceptions/NotFoundException';
import stream from 'stream';
import fs from 'fs';
import { MovieRepository } from '../../repositories/MovieRepository';

interface Params {
  id: number
}

export class GetMovieTrailerEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:id/trailer', emitter);
    this.setResponseType(ResponseType.STREAM);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Params>): Promise<stream> {
    const movie = await MovieRepository.findOneById(data.params.id);
    if (movie === null) {
      throw new NotFoundException('Movie not found');
    }
    if (movie.trailerPath === null) {
      throw new NotFoundException('No trailer for movie');
    }
    return fs.createReadStream(movie.trailerPath);
  }

}