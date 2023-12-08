import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { PutEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from '../../lib/repository';
import { NotFoundException } from '../../exceptions/NotFoundException';

interface QueryParams {
  id: number;
}

export class AddToWatchlistEndpoint extends PutEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/watchlist', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<void> {
    try {
      await this.repository.user.addToWatchlist(data.userId, data.query.id);
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Movie not found');
      }
      throw e;
    }
  }
}