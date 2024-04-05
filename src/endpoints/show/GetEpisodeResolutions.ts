import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from '../../lib/Endpoint';
import { RequestData } from '../../types/RequestData';
import { getAudioCodecsFromStreams, getVideoCodecFromStreams, getVideoMetadata, getVideoResolutionsFromStreams } from '../../util/video';
import { createClientFromUserAgent } from '../../lib/clients';
import { AvailableResolutions } from '../../types/AvailableResolutions';
import { EpisodeRepository } from '../../repositories/EpisodeRepository';

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

export class GetEpisodeResolutionsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:showId/season/:seasonNumber/episode/:episodeNumber/resolutions', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableResolutions> {
    const episodePath = await EpisodeRepository.getEpisodePath(
      data.params.showId,
      data.params.seasonNumber,
      data.params.episodeNumber
    );

    // TODO: move to common function
    const videoMetadata = await getVideoMetadata(episodePath);
    const videoCodec = videoMetadata !== undefined ? getVideoCodecFromStreams(videoMetadata) : 'unknown';
    const audioCodecs = videoMetadata !== undefined ? getAudioCodecsFromStreams(videoMetadata) : [];

    const client = createClientFromUserAgent(data.userAgent);
    const videoCodecSupported = client.isVideoCodecSupported(videoCodec);
    const audioCodecsSupported = audioCodecs.every(codec => client.isAudioCodecSupported(codec));
    const directplaySupported = videoCodecSupported && audioCodecsSupported;

    const resolutions = videoMetadata ? getVideoResolutionsFromStreams(videoMetadata) : [];
    return {
      resolutions,
      directplay: directplaySupported
    };
  }
}