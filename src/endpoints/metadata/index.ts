import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { SearchForMovieMetadataEndpoint } from "./SearchForMovieMetadata";
import { UpdateMovieMetadataEndpoint } from "./UpdateMovieMetadata";

export const createMetadataEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints: any[] = [
    new SearchForMovieMetadataEndpoint(emitter, db),
    new UpdateMovieMetadataEndpoint(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/metadata'
  }
}