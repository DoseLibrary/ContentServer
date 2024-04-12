import { EventEmitter } from 'events';
import { Config } from "../../lib/Config";
import { RouterPath } from '../../types/RouterPath';
import express from 'express';
import { IsClaimedEndpoint } from './IsClaimedEndpoint';

export const createDashboardEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints = [
    new IsClaimedEndpoint(emitter),
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/dashboard'
  }
}