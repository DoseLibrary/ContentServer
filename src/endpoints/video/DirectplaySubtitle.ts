import { EventEmitter } from "events";
import { RepositoryManager } from "../../lib/repository";
import { GetEndpoint, ResponseType } from "../../lib/Endpoint";
import { ValidationChain, param, query } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { getSubtitleFullPathById } from "../../lib/queries/subtitleQueries";
import fs from 'fs';
import stream from 'stream';
import srt2vtt from 'srt-to-vtt';

interface Param {
  subtitleId: number;
}

export class DirectplaySubtitleEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/directplay/subtitle/:subtitleId', emitter, repository);
    this.setResponseType(ResponseType.STREAM);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('subtitleId').isInt({ min: 0 }).toInt(),
      query('token').isJWT()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<stream> {
    const { subtitleId } = data.params;
    const subPath = await getSubtitleFullPathById(this.repository, subtitleId);
    if (!subPath) {
      throw new NotFoundException('Subtitle not found');
    }

    return fs.createReadStream(subPath).pipe(srt2vtt());
  }
}