import { EventEmitter } from 'events';
import express from 'express';
import { Config } from '../../lib/Config';
import { RouterPath } from '../../types/RouterPath';
import { ListGenreEndpoint } from './ListGenreEndpoint';

export const createGenreEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const router = express.Router();
  const endpoints: any[] = [
    new ListGenreEndpoint(emitter)
  ];
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/genre'
  }
}