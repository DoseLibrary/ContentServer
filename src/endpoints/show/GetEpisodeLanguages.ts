import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from '../../exceptions/NotFoundException';
import { getAudioStreamsFromMetadata, getVideoMetadata } from '../../util/video';
import { getLanguageNameFromCode } from '../../util/language';
import { AvailableLanguage } from '../../types/AvailableLanguage';
import { EpisodeRepository } from '../../repositories/EpisodeRepository';
import path from 'path';

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

export class GetEpisodeLanguagesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:showId/season/:seasonNumber/episode/:episodeNumber/languages', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ];
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableLanguage[]> {
    const episodePath = await EpisodeRepository.getEpisodePath(
      data.params.showId,
      data.params.seasonNumber,
      data.params.episodeNumber
    );
    // TODO: move to common function
    const videoMetadata = await getVideoMetadata(episodePath);
    const streams = videoMetadata !== undefined ? getAudioStreamsFromMetadata(videoMetadata) : [];
    return streams.map((stream, idx) => ({
      language: getLanguageNameFromCode(stream.tags.language),
      stream: idx
    }));
  }
}