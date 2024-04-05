import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { GetMovieTrailerEndpoint } from "./MovieTrailer";
import { GetMovieInfoEndpoint } from "./GetMovieInfo";
import { GetMovieSubtitlesEndpoint } from "./GetMovieSubtitles";
import { GetMovieResolutionsEndpoint } from "./GetMovieResolutions";
import { GetMovieLanguagesEndpoint } from "./GetMovieLanguages";
import { GetMovieRecommendationsEndpoint } from "./GetMovieRecommendations";

export const createMovieEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new GetMovieTrailerEndpoint(emitter),
    new GetMovieInfoEndpoint(emitter),
    new GetMovieResolutionsEndpoint(emitter),
    //  GetMovieSubtitlesEndpoint(emitter), TODO: FIX MEEEEE
    new GetMovieLanguagesEndpoint(emitter),
    new GetMovieRecommendationsEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/movie'
  }
}