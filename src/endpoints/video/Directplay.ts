import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseHeaders, ResponseType } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from '../../lib/repository';
import { getMoviePathById } from '../../lib/queries/movieQueries';
import { NotFoundException } from '../../exceptions/NotFoundException';
import fs from 'fs';
import stream from 'stream';
import { getEpisodePathById } from '../../lib/queries/episodeQueries';

enum Type {
  MOVIE = 'movie',
  EPISODE = 'episode'
}

interface Param {
  id: number;
}
interface Query {
  type: Type;
}

// TODO: Support episodes here as well. Episodes needs an ID.
export class DirectplayEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/directplay', emitter, repository);
    this.setResponseType(ResponseType.STREAM);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt(),
      query('type').isIn(Object.values(Type))
    ]
  }

  // Not so good, we query the db and stat the file twice. Once for headers, once for the data
  protected async headers(data: RequestData<unknown, Query, Param>): Promise<ResponseHeaders> {
    const { type } = data.query;
    const { id } = data.params;

    const path = type === Type.MOVIE ? await this.getMoviePath(id) : await this.getEpisodePath(id);
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

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<stream> {
    const { type } = data.query;
    const { id } = data.params;

    const path = type === Type.MOVIE ? await this.getMoviePath(id) : await this.getEpisodePath(id);
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

  private async getMoviePath(id: number) {
    const moviePath = await getMoviePathById(this.repository, id);
    if (!moviePath) {
      throw new NotFoundException('Movie not found');
    }
    return moviePath;
  }

  private async getEpisodePath(id: number) {
    const episodePath = await getEpisodePathById(this.repository, id);
    if (!episodePath) {
      throw new NotFoundException('Episode not found');
    }
    return episodePath;
  }
}