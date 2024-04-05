import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain, query } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { normalizeBasicShows } from "../../lib/queries/showQueries";
import { MovieRepository } from "../../repositories/MovieRepository";
import { ShowRepository } from "../../repositories/ShowRepository";
import { normalizeBasicMovies } from "../../lib/queries/movieQueries";

interface Query {
  query: string;
}

export class SearchEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('query').isString()
    ]
  }

  protected async execute(data: RequestData<unknown, Query, unknown>): Promise<unknown> {
    const { query } = data.query;
    const movies = await MovieRepository.findByTitle(query);
    const shows = await ShowRepository.findByTitle(query);
    return {
      movies: normalizeBasicMovies(movies),
      shows: normalizeBasicShows(shows)
    }
  }
}