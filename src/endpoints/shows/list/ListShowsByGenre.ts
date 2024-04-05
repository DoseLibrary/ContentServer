import { EventEmitter } from "events";
import { GetEndpoint } from "../../../lib/Endpoint";
import { ValidationChain, param, query } from "express-validator";
import { ShowOrderBy, ShowOrderByOptions, normalizeBasicShows } from "../../../lib/queries/showQueries";
import { RequestData } from "../../../types/RequestData";
import { ShowRepository } from "../../../repositories/ShowRepository";
import { BasicShowResponse } from "../../../types/show/BasicShowResponse";

interface Query {
  orderBy: ShowOrderBy;
  limit: number;
  offset: number;
}

interface Param {
  genre: string;
}

export class ListShowsByGenreEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list/genre/:genre', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('orderBy').default('addedDate').isIn(Object.values(ShowOrderBy)),
      query('limit').default(50).isInt({ min: 0 }).toInt(),
      query('offset').default(0).isInt({ min: 0 }).toInt(),
      param('genre').isString()
    ]
  }

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<BasicShowResponse[]> {
    const { genre } = data.params;
    const { limit, offset } = data.query;
    const orderBy: ShowOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const shows = await ShowRepository.findByGenre(genre, {
      take: limit,
      skip: offset,
      order: {
        [orderBy.field]: orderBy.dir
      }
    });
    return normalizeBasicShows(shows);
  }
}