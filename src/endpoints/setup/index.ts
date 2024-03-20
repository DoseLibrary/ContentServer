import { EventEmitter } from 'events';
import { Config } from "../../lib/Config";
import { RepositoryManager } from '../../lib/repository';
import { RouterPath } from '../../types/RouterPath';
import { TestDatabaseConnection } from './TestDatabaseConnection';
import express from 'express';

export const createDashboardEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints = [
    new TestDatabaseConnection(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: ''
  }
}