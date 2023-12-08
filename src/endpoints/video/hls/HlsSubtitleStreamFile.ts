import { EventEmitter } from "events";
import { RepositoryManager } from "../../../lib/repository";
import { GetEndpoint, ResponseHeaders } from "../../../lib/Endpoint";
import { ValidationChain, param, query } from "express-validator";
import { RequestData } from "../../../types/RequestData";

interface Param {
  subtitleId: number;
}

interface Query {
  token: string;
}

export class HlsSubtitleStreamFileEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/hls/subtitle/:subtitleId', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('subtitleId').isInt({ min: 0 }).toInt(),
      query('token').isJWT()
    ]
  }

  protected headers(data: RequestData<unknown, unknown, unknown>): Promise<ResponseHeaders> {
    const headers = new Headers();
    headers.set('Content-Disposition', 'attachment; filename="m3u8.m3u8"');
    return Promise.resolve({
      status: 200,
      headers
    });
  }

  protected execute(data: RequestData<unknown, Query, Param>): string {
    const { subtitleId } = data.params;
    const { token } = data.query;
    const duration = 14400; // Hard coded to 4 hours, should be enough for any subtitle
    return `#EXTM3U
#EXT-X-TARGETDURATION:${duration}
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:${duration}
/api/video/hls/subtitle/${subtitleId}/0?token=${token}
#EXT-X-ENDLIST`;
  }
}