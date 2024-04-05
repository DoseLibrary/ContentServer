import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseHeaders } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { NotFoundException } from '../../../exceptions/NotFoundException';
import { getVideoMetadata, getVideoResolutionsFromStreams, getVideoStreamsFromMetadata } from '../../../util/video';
import { v4 as uuidv4 } from 'uuid';
import { Resolution } from '../../../types/AvailableResolutions';
import { AvailableSubtitle } from '../../../types/AvailableSubtitle';
import { MovieRepository } from '../../../repositories/MovieRepository';
import { EpisodeRepository } from '../../../repositories/EpisodeRepository';

interface MovieParam {
  id: number;
}

interface EpisodeParam {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
};

interface Query {
  audioStream: number;
  token: string;
}

abstract class HlsMasterEndpoint extends GetEndpoint {
  constructor(reqPath: string, emitter: EventEmitter) {
    super(reqPath, emitter);
  }

  protected abstract getPath(param: MovieParam | EpisodeParam): Promise<string>;
  protected abstract getSubtitleStreamFilePath(param: MovieParam | EpisodeParam, token: string): string;
  protected abstract getHlsStreamFilePath(param: MovieParam | EpisodeParam, resolution: string, audioStream: number, token: string, uuid: string): string;

  protected async headers(data: RequestData<unknown, unknown, unknown>): Promise<ResponseHeaders> {
    const headers = new Headers();
    headers.set('Content-Disposition', 'attachment; filename="m3u8.m3u8"')
    return {
      status: 200,
      headers
    }
  }

  protected async execute(data: RequestData<unknown, Query, MovieParam | EpisodeParam>): Promise<string> {
    const { audioStream, token } = data.query;
    const path = await this.getPath(data.params);
    if (!path) {
      throw new NotFoundException();
    }

    const videoMetadata = await getVideoMetadata(path);
    if (!videoMetadata) {
      throw new Error("Couldn't read video metadata");
    }
    const resolutions = getVideoResolutionsFromStreams(videoMetadata);
    const [stream] = getVideoStreamsFromMetadata(videoMetadata);
    if (!stream) {
      throw new Error('No video streams found in file');
    }
    // TODO: subtitle support;
    const subtitles: AvailableSubtitle[] = []; // await this.repository[type].getSubtitles(id);
    const fps = this.calculateFps(stream.r_frame_rate);
    const uuid = uuidv4();

    let m3u8 = '#EXTM3U\n';
    m3u8 += '#EXT-X-VERSION:3\n';
    m3u8 += '#EXT-X-INDEPENDENT-SEGMENTS\n';
    m3u8 += this.getSubtitleM3u8Setting(subtitles, data.params, token);
    for (let resolution of resolutions) {
      m3u8 += this.getResolutionM3u8Setting(
        audioStream,
        resolution,
        this.getPixels(resolution),
        fps,
        data.params,
        token,
        uuid
      );
    }
    return m3u8;
  }

  private getSubtitleM3u8Setting(subtitles: AvailableSubtitle[], params: EpisodeParam | MovieParam, token: string) {
    return subtitles.map(({ language, id }) =>
      `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="${language}",NAME="${language}",FORCED=NO,AUTOSELECT=NO,DEFAULT=NO,URI="${this.getSubtitleStreamFilePath(params, token)}"\n`
    ).join('');
  }

  private getResolutionM3u8Setting(
    audioStream: number,
    resolution: string,
    pixelResolution: string,
    fps: number,
    params: EpisodeParam | MovieParam,
    token: string,
    uuid: string
  ): string {
    let bandwidth: number;
    let averageBandwidth: number;

    switch (resolution) {
      case '8k':
        bandwidth = 10000;
        averageBandwidth = 8000;
        break;
      case '4k':
        bandwidth = 6000;
        averageBandwidth = 5000;
        break;
      case '1440p':
        bandwidth = 3500;
        averageBandwidth = 3000;
        break;
      case '1080p':
        bandwidth = 2500;
        averageBandwidth = 2000;
        break;
      case '720p':
        bandwidth = 1500;
        averageBandwidth = 1000;
        break;
      case '480p':
        bandwidth = 800;
        averageBandwidth = 600;
        break;
      case '360p':
        bandwidth = 500;
        averageBandwidth = 400;
        break;
      default:
        bandwidth = 300;
        averageBandwidth = 300;
        break;
    }

    let text = `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},AVERAGE-BANDWIDTH=${averageBandwidth},VIDEO-RANGE=SDR,CODECS="avc1.640028,mp4a.40.2",RESOLUTION=${pixelResolution},FRAME-RATE=${fps},NAME="${resolution}"\n`;
    text += `${this.getHlsStreamFilePath(params, resolution, audioStream, token, uuid)}\n`;
    return text;
  }

  private calculateFps(frameRateText?: string) {
    const re = /(?<value>\d+)\/(?<divide>\d+)/;
    const matches = frameRateText?.match(re);
    const value = matches?.groups?.value || '24' // default 24;
    const divideBy = matches?.groups?.divide || '1' // default 1;
    return parseInt(value) / parseInt(divideBy);
  }

  private getPixels(resolution: Resolution) {
    switch (resolution) {
      case '8k':
        return "7680x4320";
      case '4k':
        return "3840x2160"
      case '1440p':
        return "2560x1440"
      case '1080p':
        return "1920x1080";
      case '720p':
        return "1280x720";
      case '480p':
        return "854x480";
      case '360p':
        return "640x360";
      case '240p':
        return "320x240";
      default:
        throw new Error(`Invalid resolution "${resolution}"`);
    }
  }
}

export class MovieHlsMasterEndpoint extends HlsMasterEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id/hls/master', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
    ]
  }

  protected getPath(data: MovieParam): Promise<string> {
    return MovieRepository.getMoviePathById(data.id);
  }

  protected getSubtitleStreamFilePath(data: MovieParam, token: string): string {
    return `/api/video/movie/${data.id}/hls/subtitle?token=${token}`;
  }

  protected getHlsStreamFilePath(data: MovieParam, resolution: string, audioStream: number, token: string, uuid: string): string {
    return `/api/video/movie/${data.id}/hls/${resolution}?audioStream=${audioStream}&token=${token}&transcoding=${uuid}`;
  }
}

export class EpisodeHlsMasterEndpoint extends HlsMasterEndpoint {
  constructor(emitter: EventEmitter) {
    super('/show/:showId/season/:seasonNumber/episode/:episodeNumber/hls/master', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt(),
    ]
  }

  protected getPath(data: EpisodeParam): Promise<string> {
    return EpisodeRepository.getEpisodePath(data.showId, data.seasonNumber, data.episodeNumber);
  }

  protected getSubtitleStreamFilePath(data: EpisodeParam, token: string): string {
    return `/api/video/show/${data.showId}/season/${data.seasonNumber}/episode/${data.episodeNumber}/hls/subtitle?token=${token}`;
  }

  protected getHlsStreamFilePath(data: EpisodeParam, resolution: string, audioStream: number, token: string, uuid: string): string {
    return `/api/video/show/${data.showId}/season/${data.seasonNumber}/episode/${data.episodeNumber}/hls/${resolution}?audioStream=${audioStream}&token=${token}&transcoding=${uuid}`;
  }
}