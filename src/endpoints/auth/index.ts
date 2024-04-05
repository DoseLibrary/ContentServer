import { EventEmitter } from 'events';
import { ValidateEndpoint } from './validate/Validate'
import express, { Router } from 'express';
import { Config } from '../../lib/Config';
import { RouterPath } from '../../types/RouterPath';

export const createAuthEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints = [
    new ValidateEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));
  return {
    router,
    path: '/validate'
  };
}
