import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { normalizeBasicShows, ShowOrderBy, ShowOrderByOptions } from '../../../lib/queries/showQueries';
import { ShowRepository } from '../../../repositories/ShowRepository';
import { BasicShowResponse } from '../../../types/show/BasicShowResponse';

interface QueryParams {
  orderBy: ShowOrderBy;
  limit: number;
  offset: number;
}

export class ListShowsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy', 'Order by value').default('addedDate').isIn(Object.values(ShowOrderBy)),
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicShowResponse[]> {
    const { limit, offset } = data.query;
    const orderBy: ShowOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }

    const shows = await ShowRepository.find({
      take: limit,
      skip: offset,
      order: {
        [orderBy.field]: orderBy.dir
      }
    });
    return normalizeBasicShows(shows);
  }
}
