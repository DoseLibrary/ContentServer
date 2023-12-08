import { EventEmitter } from 'events';
import express, { Router } from 'express';
import { Config } from '../../lib/Config';
import { RouterPath } from '../../types/RouterPath';
import { ListGenreEndpoint } from './ListGenreEndpoint';
import { RepositoryManager } from '../../lib/repository';

export const createGenreEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const router = express.Router();
  const endpoints: any[] = [
    new ListGenreEndpoint(emitter, db)
  ];
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/genre'
  }
}