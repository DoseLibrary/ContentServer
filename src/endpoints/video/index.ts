import { Config } from "../../lib/Config";
import { EventEmitter } from 'events';
import { RouterPath } from "../../types/RouterPath";
import express from 'express';
import { EpisodeHlsStreamFileEndpoint, MovieHlsStreamFileEndpoint } from "./hls/HlsStreamFile";
import { EpisodeHlsSegmentEndpoint, MovieHlsSegmentEndpoint } from "./hls/HlsSegment";
import { HlsStopTranscoding } from "./hls/HlsStopTranscoding";
import { DirectplaySubtitleEndpoint } from "./DirectplaySubtitle";
import { HlsSubtitleSegmentEndpoint } from "./hls/HlsSubtitleSegment";
import { HlsSubtitleStreamFileEndpoint } from "./hls/HlsSubtitleStreamFile";
import { HlsPingEndpoint } from "./hls/HlsPing";
import { EpisodeDirectplayEndpoint, MovieDirectplayEndpoint } from "./Directplay";
import { EpisodeHlsMasterEndpoint, MovieHlsMasterEndpoint } from "./hls/HlsMaster";

export const createVideoEndpoints = (config: Config, emitter: EventEmitter): RouterPath => {
  const endpoints = [
    new MovieDirectplayEndpoint(emitter),
    new EpisodeDirectplayEndpoint(emitter),
    new EpisodeHlsMasterEndpoint(emitter),
    new MovieHlsMasterEndpoint(emitter),
    new MovieHlsStreamFileEndpoint(emitter),
    new EpisodeHlsStreamFileEndpoint(emitter),
    new MovieHlsSegmentEndpoint(emitter),
    new EpisodeHlsSegmentEndpoint(emitter),
    new HlsStopTranscoding(emitter),
    // TODO: Fix subtitles
    /*
    new DirectplaySubtitleEndpoint(emitter),
    new HlsSubtitleStreamFileEndpoint(emitter),
    new HlsSubtitleSegmentEndpoint(emitter),
    */
    new HlsPingEndpoint(emitter)
  ];
  const router = express.Router();
  endpoints.forEach(endpoint => endpoint.setupEndpoint(router, config));

  return {
    router,
    path: '/video'
  }
}