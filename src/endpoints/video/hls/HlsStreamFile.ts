import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseHeaders } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from "../../../lib/repository";
import { NotFoundException } from '../../../exceptions/NotFoundException';
import { getMoviePathById } from '../../../lib/queries/movieQueries';
import { getDurationFromVideoMetadata, getVideoMetadata } from '../../../util/video';
import { getEpisodePathById } from '../../../lib/queries/episodeQueries';
import Transcoding from '../../../lib/transcodings/Transcoding';

enum Type {
  MOVIE = 'movie',
  EPISODE = 'episode'
}

interface Param {
  id: number;
  resolution: string;
}
interface Query {
  type: Type;
  audioStream: number;
  token: string;
  transcoding: string;
}

export class HlsStreamFileEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/hls/:resolution', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      param('resolution').isString(),
      query('type').isIn(Object.values(Type)),
      query('audioStream').isInt().toInt(),
      query('token').isString(),
      query('transcoding').isUUID()
    ]
  }

  protected async headers(data: RequestData<unknown, unknown, unknown>): Promise<ResponseHeaders> {
    const headers = new Headers();
    headers.set('Content-Disposition', 'attachment; filename=\"m3u8.m3u8\"');
    return {
      status: 200,
      headers
    };
  }

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<string> {
    const { id, resolution } = data.params;
    const { audioStream, type, token, transcoding } = data.query;
    const path = type === Type.MOVIE ? await getMoviePathById(this.repository, id) : await getEpisodePathById(this.repository, id);
    if (!path) {
      throw new NotFoundException();
    }

    const videoMetadata = await getVideoMetadata(path);
    if (!videoMetadata) {
      throw new Error("Couldn't read video metadata");
    }

    const duration = getDurationFromVideoMetadata(videoMetadata);
    if (!duration) {
      throw new Error('Failed to read duration from video file');
    }
    const segmentDur = Transcoding.SEGMENT_DURATION;
    const splits = Math.round(duration / segmentDur) - 1;

    // Estimate the m3u8 file
    let result = '#EXTM3U\n';
    result += '#EXT-X-VERSION:3\n';
    result += `#EXT-X-TARGETDURATION:${segmentDur}\n`;
    result += '#EXT-X-MEDIA-SEQUENCE:0\n';
    result += '#EXT-X-PLAYLIST-TYPE:VOD\n';
    for (let split = 0; split < splits; split++) {
      result += `#EXTINF:${segmentDur}, nodesc\n/api/video/${id}/hls/${resolution}/segment/${split}.ts?segments=${splits}&audioStream=${audioStream}&type=${type}&token=${token}&transcoding=${transcoding}\n`;
    }
    result += '#EXT-X-ENDLIST\n';
    return result;
  }
}