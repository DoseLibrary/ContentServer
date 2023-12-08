import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { ListShowsEndpoint } from "./list/ListShows";
import { ListEpisodes } from "./episodes/ListEpisodes";
import { ListShowsByGenreEndpoint } from "./list/ListShowsByGenre";

export const createShowsEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints: any[] = [
    new ListShowsEndpoint(emitter, db),
    new ListEpisodes(emitter, db),
    new ListShowsByGenreEndpoint(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/shows'
  }
}