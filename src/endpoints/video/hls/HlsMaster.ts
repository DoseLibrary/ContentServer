import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseHeaders } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from "../../../lib/repository";
import { getMoviePathById } from '../../../lib/queries/movieQueries';
import { NotFoundException } from '../../../exceptions/NotFoundException';
import { getVideoMetadata, getVideoResolutionsFromStreams, getVideoStreamsFromMetadata } from '../../../util/video';
import { v4 as uuidv4 } from 'uuid';
import { Resolution } from '../../../types/AvailableResolutions';
import { getEpisodePathById } from '../../../lib/queries/episodeQueries';
import { AvailableSubtitle } from '../../../types/AvailableSubtitle';

enum Type {
  MOVIE = 'movie',
  EPISODE = 'episode'
}

interface Param {
  id: number;
}
interface Query {
  type: Type;
  audioStream: number;
  token: string;
}

export class HlsMasterEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/hls/master', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      query('type').isIn(Object.values(Type)),
      query('audioStream').isInt().toInt(),
      query('token').isString()
    ]
  }

  protected async headers(data: RequestData<unknown, unknown, unknown>): Promise<ResponseHeaders> {
    const headers = new Headers();
    headers.set('Content-Disposition', 'attachment; filename="m3u8.m3u8"')
    return {
      status: 200,
      headers
    }
  }

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<string> {
    const { id } = data.params;
    const { audioStream, type, token } = data.query;
    const path = type === Type.MOVIE ? await getMoviePathById(this.repository, id) : await getEpisodePathById(this.repository, id);
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
    const subtitles = await this.repository[type].getSubtitles(id);
    const fps = this.calculateFps(stream.r_frame_rate);
    const uuid = uuidv4();

    let m3u8 = '#EXTM3U\n';
    m3u8 += '#EXT-X-VERSION:3\n';
    m3u8 += '#EXT-X-INDEPENDENT-SEGMENTS\n';
    m3u8 += this.getSubtitleM3u8Setting(subtitles, type, token);
    for (let resolution of resolutions) {
      m3u8 += this.getResolutionM3u8Setting(
        audioStream,
        resolution,
        this.getPixels(resolution),
        fps,
        id,
        type,
        token,
        uuid
      );
    }
    return m3u8;
  }

  private getSubtitleM3u8Setting(subtitles: AvailableSubtitle[], type: string, token: string) {
    return subtitles.map(({ language, id }) =>
      `#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",LANGUAGE="${language}",NAME="${language}",FORCED=NO,AUTOSELECT=NO,DEFAULT=NO,URI="/api/video/hls/subtitle/${id}?token=${token}"\n`
    ).join('');
  }

  private getResolutionM3u8Setting(
    audioStream: number,
    resolution: string,
    pixelResolution: string,
    fps: number,
    id: number,
    type: string,
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
    text += `/api/video/${id}/hls/${resolution}?&audioStream=${audioStream}&type=${type}&token=${token}&transcoding=${uuid}\n`;
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