import { EventEmitter } from 'events';
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain } from 'express-validator';
import { GenreRepository } from '../../repositories/GenreRepository';

export class ListGenreEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list', emitter);
  }

  public getValidator(): ValidationChain[] {
    return [];
  }

  async execute() {
    const genres = await GenreRepository.find();
    return genres.map(genres => genres.name);
  }
}