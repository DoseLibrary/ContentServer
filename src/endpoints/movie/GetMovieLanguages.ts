import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import { getMoviePathById } from '../../lib/queries/movieQueries';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { getAudioStreamsFromMetadata, getVideoMetadata } from '../../util/video';
import { getLanguageNameFromCode } from '../../util/language';
import { AvailableLanguage } from '../../types/AvailableLanguage';

interface Param {
  id: number;
}

export class GetMovieLanguagesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/languages', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableLanguage[]> {
    const moviePath = await getMoviePathById(this.repository, data.params.id);
    if (!moviePath) {
      throw new NotFoundException('Movie not found');
    }

    // TODO: move to common function
    const videoMetadata = await getVideoMetadata(moviePath);
    const streams = videoMetadata !== undefined ? getAudioStreamsFromMetadata(videoMetadata) : [];
    return streams.map((stream, idx) => ({
      language: getLanguageNameFromCode(stream.tags.language),
      stream: idx
    }));
  }
}