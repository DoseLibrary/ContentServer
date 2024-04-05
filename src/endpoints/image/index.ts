import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { GetImageEndpoint } from "./GetImage";
import { ListExternalImagesEndpoint } from "./ListExternalImages";

export const createImageEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints: any[] = [
    new GetImageEndpoint(emitter),
    new ListExternalImagesEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/image'
  }
}