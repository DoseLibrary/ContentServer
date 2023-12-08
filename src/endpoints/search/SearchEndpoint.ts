import { EventEmitter } from "events";
import { RepositoryManager } from "../../lib/repository";
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain, query } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { listMoviesByTitleWithMetadata, normalizeMovies } from "../../lib/queries/movieQueries";
import { listShowsByTitleWithMetadata, normalizeShows } from "../../lib/queries/showQueries";

interface Query {
  query: string;
}

export class SearchEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('query').isString()
    ]
  }

  protected async execute(data: RequestData<unknown, Query, unknown>): Promise<unknown> {
    const { query } = data.query;
    const movies = await listMoviesByTitleWithMetadata(this.repository, query);
    const shows = await listShowsByTitleWithMetadata(this.repository, query);
    return {
      movies: normalizeMovies(movies),
      shows: normalizeShows(shows)
    }
  }
}