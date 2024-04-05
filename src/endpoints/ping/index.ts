import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { PingEndpoint } from "./Ping";

export const createPingEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new PingEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/ping'
  }
}