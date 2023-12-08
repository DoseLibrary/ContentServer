import { EventEmitter } from "events";
import { RepositoryManager } from "../../../lib/repository";
import { GetEndpoint, ResponseHeaders, ResponseType } from "../../../lib/Endpoint";
import { ValidationChain, param, query } from "express-validator";
import { RequestData } from "../../../types/RequestData";
import { getSubtitleFullPathById } from "../../../lib/queries/subtitleQueries";
import transcodingManager from "../../../lib/transcodings/TranscodingManager";
import fs from 'fs';
import path from 'path';

interface Param {
  subtitleId: number;
}

// Hard coded to only 1 subtitle segment
export class HlsSubtitleSegmentEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/hls/subtitle/:subtitleId/0', emitter, repository);
    this.setResponseType(ResponseType.FILE);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('subtitleId').isInt({ min: 0 }).toInt(),
      query('token').isJWT()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<string> {
    const subtitlePath = await getSubtitleFullPathById(this.repository, data.params.subtitleId);
    if (!subtitlePath) {
      throw new Error('Subtitle not found');
    }
    return transcodingManager.transcodeSubtitle(subtitlePath)
  }

  // Delete the temporary file after it has been sent
  protected async fileSent(file: string): Promise<void> {
    fs.promises.rm(path.dirname(file), { recursive: true, force: true });
  }
}