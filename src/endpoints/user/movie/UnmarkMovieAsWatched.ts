import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { DeleteEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from "../../../lib/repository";
import { NotFoundException } from "../../../exceptions/NotFoundException";

interface Param {
  id: number;
}

export class UnmarkMovieAsWatchedEndpoint extends DeleteEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/movie/:id/watched', emitter, repository);
  }


  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<void> {
    await this.repository.user.unmarkMovieAsWatched(data.userId, data.params.id);
  }
}