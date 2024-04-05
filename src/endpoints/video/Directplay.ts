import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseHeaders, ResponseType } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import fs from 'fs';
import stream from 'stream';
import { MovieRepository } from '../../repositories/MovieRepository';
import { EpisodeRepository } from '../../repositories/EpisodeRepository';

interface MovieParam {
  id: number;
}

interface EpisodeParam {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
};

abstract class DirectplayEndpoint extends GetEndpoint {
  constructor(reqPath: string, emitter: EventEmitter) {
    super(reqPath, emitter);
    this.setResponseType(ResponseType.STREAM);
  }

  protected abstract getPath(param: MovieParam | EpisodeParam): Promise<string>;

  // Not so good, we query the db and stat the file twice. Once for headers, once for the data
  protected async headers(data: RequestData<unknown, unknown, MovieParam | EpisodeParam>): Promise<ResponseHeaders> {
    const path = await this.getPath(data.params);
    const size = await this.getFileSize(path);

    const range = data.headers.range || 'bytes=0-';
    const positions = range.replace(/bytes=/, '').split('-');
    const start = Number.parseInt(positions[0], 10);
    const total = size;
    const end = positions[1] ? Number.parseInt(positions[1], 10) : total - 1;
    const chunkSize = end - start + 1;

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Range', `bytes ${start}-${end}/${total}`);
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Content-Length', chunkSize.toString());
    responseHeaders.set('Content-Type', 'video/mp4');

    return {
      status: 206,
      headers: responseHeaders
    };
  }

  protected async execute(data: RequestData<unknown, unknown, MovieParam | EpisodeParam>): Promise<stream> {
    const path = await this.getPath(data.params);
    const size = await this.getFileSize(path);

    const range = data.headers.range || 'bytes=0-';
    const positions = range.replace(/bytes=/, '').split('-');
    const start = Number.parseInt(positions[0], 10);
    const total = size;
    const end = positions[1] ? Number.parseInt(positions[1], 10) : total - 1;
    return fs.createReadStream(path, { start, end });
  }

  private getFileSize(filePath: string) {
    return fs.promises.stat(filePath)
      .then(stats => stats.size);
  }
}

export class MovieDirectplayEndpoint extends DirectplayEndpoint {
  constructor(emitter: EventEmitter) {
    super('/movie/:id/directplay', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
    ]
  }

  protected getPath(data: MovieParam): Promise<string> {
    return MovieRepository.getMoviePathById(data.id);
  }
}

export class EpisodeDirectplayEndpoint extends DirectplayEndpoint {
  constructor(emitter: EventEmitter) {
    super('/show/:showId/season/:seasonNumber/episode/:episodeNumber/directplay', emitter);
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
}