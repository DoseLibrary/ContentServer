import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { PostEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from "../../../lib/repository";
import { NotFoundException } from "../../../exceptions/NotFoundException";

interface Param {
  id: number;
}

export class MarkMovieAsWatchedEndpoint extends PostEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/movie/:id/watched', emitter, repository);
  }


  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<void> {
    try {
      await this.repository.user.markMovieAsWatched(data.userId, data.params.id);
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Movie not found');
      }
      throw e;
    }
  }

}