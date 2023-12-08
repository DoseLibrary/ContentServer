import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseType } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from "../../../lib/repository";
import { getMoviePathById } from '../../../lib/queries/movieQueries';
import { NotFoundException } from '../../../exceptions/NotFoundException';
import transcodingManager from '../../../lib/transcodings/TranscodingManager';
import { Resolution } from '../../../types/AvailableResolutions';
import { Log } from '../../../lib/Logger';
import path from 'path';
import fs from 'fs';
import Transcoding from '../../../lib/transcodings/Transcoding';
import { getEpisodePathById } from '../../../lib/queries/episodeQueries';

enum Type {
  MOVIE = 'movie',
  EPISODE = 'episode'
}

interface Param {
  id: number;
  resolution: Resolution;
  segment: number;
}
interface Query {
  type: Type;
  audioStream: number;
  token: string;
  transcoding: string;
}

export class HlsSegmentEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/hls/:resolution/segment/:segment.ts', emitter, repository);
    this.setResponseType(ResponseType.FILE);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      param('resolution').isString(),
      param('segment').isInt({ min: 0 }).toInt(),
      query('type').isIn(Object.values(Type)),
      query('audioStream').isInt().toInt(),
      query('token').isString(),
      query('transcoding').isUUID()
    ]
  }

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<string> {
    const { id, resolution, segment } = data.params;
    const transcodingId = data.query.transcoding;
    const { audioStream, type, token } = data.query;
    const path = type === Type.MOVIE ? await getMoviePathById(this.repository, id) : await getEpisodePathById(this.repository, id);
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