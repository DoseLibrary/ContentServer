import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { GetShowInfo } from "./GetShowInfo";
import { GetSeasonInfo } from "./GetSeasonInfo";
import { GetEpisodeInfo } from "./GetEpisodeInfo";
import { GetEpisodeSubtitlesEndpoint } from "./GetEpisodeSubtitles";
import { GetEpisodeLanguagesEndpoint } from "./GetEpisodeLanguages";
import { GetEpisodeResolutionsEndpoint } from "./GetEpisodeResolutions";
import { GetNextEpisode } from "./GetNextEpisode";

export const createShowEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new GetShowInfo(emitter),
    new GetSeasonInfo(emitter),
    new GetEpisodeInfo(emitter),
    // new GetEpisodeSubtitlesEndpoint(emitter), TODO: ADD ME
    new GetEpisodeLanguagesEndpoint(emitter),
    new GetEpisodeResolutionsEndpoint(emitter),
    new GetNextEpisode(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/show'
  }
}