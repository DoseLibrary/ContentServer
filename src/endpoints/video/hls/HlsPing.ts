import { EventEmitter } from "events";
import { RepositoryManager } from "../../../lib/repository";
import { PostEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { ValidationChain, query } from "express-validator";
import transcodingManager from "../../../lib/transcodings/TranscodingManager";

interface Query {
  transcoding: string;
}

export class HlsPingEndpoint extends PostEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/hls/ping', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('transcoding').isUUID()
    ]
  }

  protected execute(data: RequestData<unknown, Query, unknown>): void {
    transcodingManager.setLastRequestedTime(data.query.transcoding)
  }
}