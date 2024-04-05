import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from '../../exceptions/NotFoundException';
import { getAudioStreamsFromMetadata, getVideoMetadata } from '../../util/video';
import { getLanguageNameFromCode } from '../../util/language';
import { AvailableLanguage } from '../../types/AvailableLanguage';
import { MovieRepository } from '../../repositories/MovieRepository';

interface Param {
  id: number;
}

export class GetMovieLanguagesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:id/languages', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableLanguage[]> {
    const movie = await MovieRepository.findOneById(data.params.id);
    if (movie?.path === undefined) {
      throw new NotFoundException('Movie not found');
    }

    // TODO: move to common function
    const videoMetadata = await getVideoMetadata(movie.path);
    const streams = videoMetadata !== undefined ? getAudioStreamsFromMetadata(videoMetadata) : [];
    return streams.map((stream, idx) => ({
      language: getLanguageNameFromCode(stream.tags.language),
      stream: idx
    }));
  }
}