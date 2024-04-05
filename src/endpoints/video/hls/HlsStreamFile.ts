import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseHeaders } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { NotFoundException } from '../../../exceptions/NotFoundException';
import { getDurationFromVideoMetadata, getVideoMetadata } from '../../../util/video';
import Transcoding from '../../../lib/transcodings/Transcoding';
import { MovieRepository } from '../../../repositories/MovieRepository';
import { EpisodeRepository } from '../../../repositories/EpisodeRepository';

interface MovieParam {
  id: number;
  resolution: string;
}

interface EpisodeParam {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  resolution: string;
};
interface Query {
  audioStream: number;
  token: string;
  transcoding: string;
}

abstract class HlsStreamFileEndpoint extends GetEndpoint {
  constructor(reqPath: string, emitter: EventEmitter) {
    super(reqPath, emitter);
  }

  protected abstract getPath(param: MovieParam | EpisodeParam): Promise<string>;
  protected abstract getSegmentPath(data: MovieParam | EpisodeParam, query: Query, segment: number, segments: number): string

  protected async headers(data: RequestData<unknown, unknown, unknown>): Promise<ResponseHeaders> {
    const headers = new Headers();
    headers.set('Content-Disposition', 'attachment; filename=\"m3u8.m3u8\"');
    return {
      status: 200,
      headers
    };
  }

  protected async execute(data: RequestData<unknown, Query, MovieParam | EpisodeParam>): Promise<string> {
    const { audioStream, token, transcoding } = data.query;
    const path = await this.getPath(data.params);
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
      const segmentPath = this.getSegmentPath(
        data.params,
        data.query,
        split,
        splits
      );
      result += `#EXTINF:${segmentDur}, nodesc\n${segmentPath}\n`;
    }
    result += '#EXT-X-ENDLIST\n';
    return result;
  }
}

export class MovieHlsStreamFileEndpoint extends HlsStreamFileEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id/hls/:resolution', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      param('resolution').isString(),
      query('audioStream').isInt().toInt(),
      query('token').isString(),
      query('transcoding').isUUID()
    ]
  }

  protected getPath(data: MovieParam): Promise<string> {
    return MovieRepository.getMoviePathById(data.id);
  }

  protected getSegmentPath(params: MovieParam, query: Query, segment: number, segments: number): string {
    return `/api/video/movie/${params.id}/hls/${params.resolution}/segment/${segment}.ts?segments=${segments}&audioStream=${query.audioStream}&token=${query.token}&transcoding=${query.transcoding}`;
  }
}

export class EpisodeHlsStreamFileEndpoint extends HlsStreamFileEndpoint {
  constructor(emitter: EventEmitter) {
    super('/show/:showId/season/:seasonNumber/episode/:episodeNumber/hls/:resolution', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt(),
      param('resolution').isString(),
      query('audioStream').isInt().toInt(),
      query('token').isString(),
      query('transcoding').isUUID()
    ]
  }

  protected getPath(data: EpisodeParam): Promise<string> {
    return EpisodeRepository.getEpisodePath(data.showId, data.seasonNumber, data.episodeNumber);
  }

  protected getSegmentPath(params: EpisodeParam, query: Query, segment: number, segments: number): string {
    return `/api/video/show/${params.showId}/season/${params.seasonNumber}/episode/${params.episodeNumber}/hls/${params.resolution}/segment/${segment}.ts?segments=${segments}&audioStream=${query.audioStream}&token=${query.token}&transcoding=${query.transcoding}`;
  }
}