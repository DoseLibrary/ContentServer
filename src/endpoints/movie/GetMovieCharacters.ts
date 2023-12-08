import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import { Character, getMovieCharactersByMovieId } from '../../lib/queries/actorQueries';

interface Param {
  id: number;
}

export class GetMovieCharactersEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/characters', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<Character[]> {
    return getMovieCharactersByMovieId(this.repository, data.params.id);
  }
}