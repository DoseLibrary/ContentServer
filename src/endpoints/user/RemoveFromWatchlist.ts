import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { DeleteEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from '../../lib/repository';

interface QueryParams {
  id: number;
}

export class RemoveFromWatchlistEndpoint extends DeleteEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/watchlist', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<void> {
    await this.repository.user.removeFromWatchlist(data.userId, data.query.id);
  }
}