import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { GetShowInfo } from "./GetShowInfo";
import { GetSeasonInfo } from "./GetSeasonInfo";
import { GetEpisodeInfo } from "./GetEpisodeInfo";
import { GetEpisodeSubtitlesEndpoint } from "./GetEpisodeSubtitles";
import { GetEpisodeLanguagesEndpoint } from "./GetEpisodeLanguages";
import { GetEpisodeResolutionsEndpoint } from "./GetEpisodeResolutions";
import { GetNextEpisode } from "./GetNextEpisode";

export const createShowEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints: any[] = [
    new GetShowInfo(emitter, db),
    new GetSeasonInfo(emitter, db),
    new GetEpisodeInfo(emitter, db),
    new GetEpisodeSubtitlesEndpoint(emitter, db),
    new GetEpisodeLanguagesEndpoint(emitter, db),
    new GetEpisodeResolutionsEndpoint(emitter, db),
    new GetNextEpisode(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/show'
  }
}