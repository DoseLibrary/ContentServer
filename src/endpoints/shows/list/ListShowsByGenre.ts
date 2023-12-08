import { EventEmitter } from "events";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RepositoryManager } from "../../../lib/repository";
import { ValidationChain, param, query } from "express-validator";
import { ShowOrderBy, ShowOrderByOptions, listShowsByGenreWithMetadata, normalizeShows } from "../../../lib/queries/showQueries";
import { RequestData } from "../../../types/RequestData";
import { ShowResponse } from "../types/ShowResponse";

interface Query {
  orderBy: ShowOrderBy;
  limit: number;
  offset: number;
}

interface Param {
  genre: string;
}

export class ListShowsByGenreEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list/genre/:genre', emitter, repository);
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

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<ShowResponse[]> {
    const { genre } = data.params;
    const { limit, offset } = data.query;
    const orderBy: ShowOrderByOptions = {
      field: data.query.orderBy,
      dir: 'desc'
    }
    const shows = await listShowsByGenreWithMetadata(this.repository, genre, orderBy, limit, offset);
    return normalizeShows(shows);
  }
}