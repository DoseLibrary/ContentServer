import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from '../../lib/repository';
import { AvailableSubtitle } from '../../types/AvailableSubtitle';

interface Param {
  id: number;
}

// TODO: This endpoint is using the internal episode id, not showId, seasonNumber, episodeNumber
// The frontend should be updated to support showId, seasonNumber, episodeNumber instead of episodeId
export class GetEpisodeSubtitlesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/episode/:id/subtitles', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableSubtitle[]> {
    return this.repository.episode.getSubtitles(data.params.id)
      .then(subtitles => subtitles.map(subtitle => ({
        id: subtitle.id,
        language: subtitle.language
      })));
  }
}