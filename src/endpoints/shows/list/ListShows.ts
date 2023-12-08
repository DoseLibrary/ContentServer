import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from '../../../lib/repository';
import { ImageType } from '@prisma/client';
import { ShowResponse } from '../types/ShowResponse';
import { ShowOrderBy, ShowOrderByOptions, listShowsWithMetadata, normalizeShows } from '../../../lib/queries/showQueries';

interface QueryParams {
  orderBy: ShowOrderBy;
  limit: number;
  offset: number;
}

export class ListShowsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy', 'Order by value').default('addedDate').isIn(Object.values(ShowOrderBy)),
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<ShowResponse[]> {
    const { limit, offset } = data.query;
    const orderBy: ShowOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const shows = await listShowsWithMetadata(this.repository, orderBy, limit, offset);
    return normalizeShows(shows);
  }
}