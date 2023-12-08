import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import { NotFoundException } from '../../exceptions/NotFoundException';
import { getAudioStreamsFromMetadata, getVideoMetadata } from '../../util/video';
import { getLanguageNameFromCode } from '../../util/language';
import { AvailableLanguage } from '../../types/AvailableLanguage';
import { getEpisodePathById } from '../../lib/queries/episodeQueries';

interface Param {
  id: number;
}

// TODO: This endpoint is using the internal episode id, not showId, seasonNumber, episodeNumber
// The frontend should be updated to support showId, seasonNumber, episodeNumber instead of episodeId
export class GetEpisodeLanguagesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/episode/:id/languages', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableLanguage[]> {
    const episodePath = await getEpisodePathById(this.repository, data.params.id);
    if (!episodePath) {
      throw new NotFoundException('Episode not found');
    }

    // TODO: move to common function
    const videoMetadata = await getVideoMetadata(episodePath);
    const streams = videoMetadata !== undefined ? getAudioStreamsFromMetadata(videoMetadata) : [];
    return streams.map((stream, idx) => ({
      language: getLanguageNameFromCode(stream.tags.language),
      stream: idx
    }));
  }
}