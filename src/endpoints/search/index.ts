import { EventEmitter } from "events";
import { Config } from "../../lib/Config";
import { RouterPath } from "../../types/RouterPath";
import { SearchEndpoint } from "./SearchEndpoint";
import express from 'express';

export const createSearchEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints = [
    new SearchEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/search'
  }
}
