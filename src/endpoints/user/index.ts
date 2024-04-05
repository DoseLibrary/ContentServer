import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { ListOngoingMovies } from "./ongoing/ListOngoingMovies";
import { ListOngoingEpisodes } from "./ongoing/ListOngoingEpisodes";
import { GetMovieWatchlist } from "./GetMovieWatchlist";
import { AddToWatchlistEndpoint } from "./AddToWatchlist";
import { RemoveFromWatchlistEndpoint } from "./RemoveFromWatchlist";
import { MarkMovieAsWatchedEndpoint } from "./movie/MarkMovieAsWatched";
import { UnmarkMovieAsWatchedEndpoint } from "./movie/UnmarkMovieAsWatched";
import { UpdateMovieWatchtimeEndpoint } from "./movie/UpdateMovieWatchtime";
import { UpdateEpisodeWatchtimeEndpoint } from "./show/UpdateEpisodeWatchtime";
import { GetUserMovieData } from "./movie/GetUserMovieData";

export const createUserEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new ListOngoingMovies(emitter),
    new ListOngoingEpisodes(emitter),
    new GetMovieWatchlist(emitter),
    new UpdateMovieWatchtimeEndpoint(emitter),
    new UpdateEpisodeWatchtimeEndpoint(emitter),
    new AddToWatchlistEndpoint(emitter),
    new RemoveFromWatchlistEndpoint(emitter),
    new MarkMovieAsWatchedEndpoint(emitter),
    new UnmarkMovieAsWatchedEndpoint(emitter),
    new GetUserMovieData(emitter),
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/user'
  }
}