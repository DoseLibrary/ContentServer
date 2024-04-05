import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { SearchForMovieMetadataEndpoint } from "./SearchForMovieMetadata";
import { UpdateMovieMetadataEndpoint } from "./UpdateMovieMetadata";

export const createMetadataEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new SearchForMovieMetadataEndpoint(emitter),
    // new UpdateMovieMetadataEndpoint(emitter) TODO: Fix after relook on how images are stored
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/metadata'
  }
}