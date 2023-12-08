import { EventEmitter } from "events";
import { DeleteEndpoint } from "../../../lib/Endpoint";
import { RepositoryManager } from "../../../lib/repository";
import { ValidationChain, query } from "express-validator";
import transcodingManager from "../../../lib/transcodings/TranscodingManager";
import { RequestData } from "../../../types/RequestData";
import { Log } from "../../../lib/Logger";

interface Query {
  id: string;
};

export class HlsStopTranscoding extends DeleteEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/hls/stop', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('id').isUUID()
    ]
  };

  // TODO: Check that the transcoding is for the user
  protected async execute(data: RequestData<unknown, Query, unknown>): Promise<void> {
    const { id } = data.query;
    const removed = transcodingManager.remove(id);
    if (removed) {
      Log.info(`Transcoding ${id} stopped`);
    } else {
      Log.warning(`Transcoding ${id} not found`);
    }
  }
}
