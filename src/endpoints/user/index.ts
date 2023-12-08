import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { ListOngoingMovies } from "./ongoing/ListOngoingMovies";
import { ListOngoingEpisodes } from "./ongoing/ListOngoingEpisodes";
import { UpdateCurrentWatchtimeEndpoint } from "./UpdateCurrentWatchTime";
import { GetUserMovieData } from "./movie/GetUserMovieData";
import { GetMovieWatchlist } from "./GetMovieWatchlist";
import { AddToWatchlistEndpoint } from "./AddToWatchlist";
import { RemoveFromWatchlistEndpoint } from "./RemoveFromWatchlist";
import { MarkMovieAsWatchedEndpoint } from "./movie/MarkMovieAsWatched";
import { UnmarkMovieAsWatchedEndpoint } from "./movie/UnmarkMovieAsWatched";
import { GetUserEpisodeData } from "./show/GetUserEpisodeData";

export const createUserEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints: any[] = [
    new ListOngoingMovies(emitter, db),
    new ListOngoingEpisodes(emitter, db),
    new GetMovieWatchlist(emitter, db),
    new UpdateCurrentWatchtimeEndpoint(emitter, db),
    new GetUserMovieData(emitter, db),
    new AddToWatchlistEndpoint(emitter, db),
    new RemoveFromWatchlistEndpoint(emitter, db),
    new MarkMovieAsWatchedEndpoint(emitter, db),
    new UnmarkMovieAsWatchedEndpoint(emitter, db),
    new GetUserEpisodeData(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/user'
  }
}