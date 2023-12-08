import { EventEmitter } from 'events';
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain } from 'express-validator';
import { RepositoryManager } from '../../lib/repository';
interface ListGenreResponse {
  genres: string[]
}

export class ListGenreEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, db: RepositoryManager) {
    super('/list', emitter, db);
  }

  public getValidator(): ValidationChain[] {
    return [];
  }

  async execute() {
    const genres = await this.repository.genre.list();
    return genres.map(genres => genres.name);
  }
}