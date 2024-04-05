import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { ListShowsEndpoint } from "./list/ListShows";
import { ListEpisodes } from "./episodes/ListEpisodes";
import { ListShowsByGenreEndpoint } from "./list/ListShowsByGenre";

export const createShowsEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new ListShowsEndpoint(emitter),
    new ListEpisodes(emitter),
    new ListShowsByGenreEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/shows'
  }
}