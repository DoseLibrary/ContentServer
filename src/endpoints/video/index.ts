import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { RepositoryManager } from "../../lib/repository";
import { DirectplayEndpoint } from "./Directplay";
import { HlsMasterEndpoint } from "./hls/HlsMaster";
import { HlsStreamFileEndpoint } from "./hls/HlsStreamFile";
import { HlsSegmentEndpoint } from "./hls/HlsSegment";
import { HlsStopTranscoding } from "./hls/HlsStopTranscoding";
import { DirectplaySubtitleEndpoint } from "./DirectplaySubtitle";
import { HlsSubtitleSegmentEndpoint } from "./hls/HlsSubtitleSegment";
import { HlsSubtitleStreamFileEndpoint } from "./hls/HlsSubtitleStreamFile";
import { HlsPingEndpoint } from "./hls/HlsPing";

export const createVideoEndpoints = (config: Config, emitter: EventEmitter, db: RepositoryManager): RouterPath => {
  const endpoints = [
    new DirectplayEndpoint(emitter, db),
    new HlsMasterEndpoint(emitter, db),
    new HlsStreamFileEndpoint(emitter, db),
    new HlsSegmentEndpoint(emitter, db),
    new HlsStopTranscoding(emitter, db),
    new DirectplaySubtitleEndpoint(emitter, db),
    new HlsSubtitleStreamFileEndpoint(emitter, db),
    new HlsSubtitleSegmentEndpoint(emitter, db),
    new HlsPingEndpoint(emitter, db)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/video'
  }
}