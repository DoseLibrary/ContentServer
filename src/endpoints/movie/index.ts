import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { GetMovieTrailerEndpoint } from "./MovieTrailer";
import { GetMovieInfoEndpoint } from "./GetMovieInfo";
import { GetMovieCharactersEndpoint } from "./GetMovieCharacters";
import { GetMovieSubtitlesEndpoint } from "./GetMovieSubtitles";
import { GetMovieResolutionsEndpoint } from "./GetMovieResolutions";
import { GetMovieLanguagesEndpoint } from "./GetMovieLanguages";
import { GetMovieRecommendationsEndpoint } from "./GetMovieRecommendations";

export const createMovieEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints: any[] = [
    new GetMovieTrailerEndpoint(emitter, db),
    new GetMovieInfoEndpoint(emitter, db),
    new GetMovieCharactersEndpoint(emitter, db),
    new GetMovieResolutionsEndpoint(emitter, db),
    new GetMovieSubtitlesEndpoint(emitter, db),
    new GetMovieLanguagesEndpoint(emitter, db),
    new GetMovieRecommendationsEndpoint(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/movie'
  }
}