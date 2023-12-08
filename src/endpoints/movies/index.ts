import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { ListPopularMoviesEndpoint } from "./list/ListPopularMovies";
import { GetRandomMovieEndpoint } from "./GetRandomMovie";
import { ListAllMoviesEndpoint } from "./list/ListAllMovies";
import { ListMoviesByGenreEndpoint } from "./list/ListMoviesByGenre";

export const createMoviesEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints: any[] = [
    new ListAllMoviesEndpoint(emitter, db),
    new ListPopularMoviesEndpoint(emitter, db),
    new ListMoviesByGenreEndpoint(emitter, db),
    new GetRandomMovieEndpoint(emitter, db),
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/movies'
  }
}