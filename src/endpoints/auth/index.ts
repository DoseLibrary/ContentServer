import { EventEmitter } from 'events';
import { ValidateEndpoint } from './validate/Validate'
import express, { Router } from 'express';
import { Config } from '../../lib/Config';
import { RouterPath } from '../../types/RouterPath';
import { RepositoryManager } from '../../lib/repository';

export const createAuthEndpoints = (config: Config, emitter: EventEmitter, repository: RepositoryManager): RouterPath => {
  const endpoints = [
    new ValidateEndpoint(emitter, repository)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));
  return {
    router,
    path: '/validate'
  };
}
