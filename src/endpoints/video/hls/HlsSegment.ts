import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseType } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { NotFoundException } from '../../../exceptions/NotFoundException';
import transcodingManager from '../../../lib/transcodings/TranscodingManager';
import { Resolution } from '../../../types/AvailableResolutions';
import { Log } from '../../../lib/Logger';
import path from 'path';
import fs from 'fs';
import Transcoding from '../../../lib/transcodings/Transcoding';
import { MovieRepository } from '../../../repositories/MovieRepository';
import { EpisodeRepository } from '../../../repositories/EpisodeRepository';

interface MovieParam {
  id: number;
  resolution: Resolution;
  segment: number;
}

interface EpisodeParam {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  resolution: Resolution;
  segment: number;
};

interface Query {
  audioStream: number;
  token: string;
  transcoding: string;
}

abstract class HlsSegmentEndpoint extends GetEndpoint {
  constructor(reqPath: string, emitter: EventEmitter) {
    super(reqPath, emitter);
    this.setResponseType(ResponseType.FILE);
  }

  protected abstract getPath(param: MovieParam | EpisodeParam): Promise<string>;

  protected async execute(data: RequestData<unknown, Query, MovieParam | EpisodeParam>): Promise<string> {
    const { resolution, segment } = data.params;
    const transcodingId = data.query.transcoding;
    const { audioStream, token } = data.query;
    const path = await this.getPath(data.params);
    if (!path) {
      throw new NotFoundException();
    }
    // TODO: Lock needed?

    let transcoding = transcodingManager.get(transcodingId);
    if (!transcoding) {
      transcoding = await transcodingManager.create(
        data.query.transcoding,
        path,
        resolution,
        audioStream,
        this.config.transcoding.primaryVideoCodec // TODO: Check secondary first
      );
    }
    transcodingManager.setLastRequestedTime(transcodingId);
    if (transcoding.resolution !== resolution) {
      Log.debug(`[HLS] Changing resolution from ${transcoding.resolution} to ${resolution}`);
      transcoding.restart(segment, resolution);
    }
    if (segment > transcoding.latestSegment + 10) {
      Log.debug(`[HLS] Restarting transcoding because of too long seek (Requested segment: ${segment}, current segment: ${transcoding.latestSegment})`);
      transcoding.restart(segment, resolution);
    }
    if (segment < transcoding.startSegment) {
      Log.debug(`[HLS] Seeking in the past for a segment that doesn't exist (Requested segment: ${segment}, current segment: ${transcoding.startSegment})`);
      transcoding.restart(segment, resolution);
    }

    try {
      const segmentPath = await this.waitUntilSegmentProcessed(segment, transcoding);
      return segmentPath;
    } catch (error) {
      Log.debug(`[HLS] Segment ${segment} was never created`);
      throw new NotFoundException('Segment was never created');
    }

    // TODO: If we seek inside "fast seek" part and fast seek is finished, restart transcoding
  }

  private async waitUntilSegmentProcessed(segment: number, transcoding: Transcoding): Promise<string> {
    const segmentPath = path.join(transcoding.output, `${segment}.ts`);
    const segmentExists = await this.fileExists(segmentPath);
    if (segmentExists) {
      return segmentPath;
    }

    if (!transcoding.isActive()) {
      throw new Error('Transcoding was stopped');
    }
    
    // Wait for a short period before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Check again
    return this.waitUntilSegmentProcessed(segment, transcoding);
  }

  private fileExists(filePath: string) {
    return fs.promises.access(filePath, fs.constants.R_OK)
      .then(() => true)
      .catch(() => false);
  }
}

export class MovieHlsSegmentEndpoint extends HlsSegmentEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id/hls/:resolution/segment/:segment.ts', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      param('resolution').isString(),
      param('segment').isInt({ min: 0 }).toInt(),
      query('audioStream').isInt().toInt(),
      query('token').isString(),
      query('transcoding').isUUID()
    ]
  }

  protected getPath(data: MovieParam): Promise<string> {
    return MovieRepository.getMoviePathById(data.id);
  }
}

export class EpisodeHlsSegmentEndpoint extends HlsSegmentEndpoint {
  constructor(emitter: EventEmitter) {
    super('/show/:showId/season/:seasonNumber/episode/:episodeNumber/hls/:resolution/segment/:segment.ts', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt(),
      param('resolution').isString(),
      param('segment').isInt({ min: 0 }).toInt(),
      query('audioStream').isInt().toInt(),
      query('token').isString(),
      query('transcoding').isUUID()
    ]
  }

  protected getPath(data: EpisodeParam): Promise<string> {
    return EpisodeRepository.getEpisodePath(data.showId, data.seasonNumber, data.episodeNumber);
  }
}