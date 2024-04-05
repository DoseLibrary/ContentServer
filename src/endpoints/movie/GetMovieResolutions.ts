import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from '../../lib/Endpoint';
import { RequestData } from '../../types/RequestData';
import { getAudioCodecsFromStreams, getVideoCodecFromStreams, getVideoMetadata, getVideoResolutionsFromStreams } from '../../util/video';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { createClientFromUserAgent } from '../../lib/clients';
import { AvailableResolutions } from '../../types/AvailableResolutions';
import { MovieRepository } from '../../repositories/MovieRepository';

interface Param {
  id: number;
}

export class GetMovieResolutionsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:id/resolutions', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableResolutions> {
    const moviePath = await MovieRepository.getMoviePathById(data.params.id);
    if (moviePath === undefined) {
      throw new NotFoundException('Movie not found');
    }

    // TODO: move to common function
    const videoMetadata = await getVideoMetadata(moviePath);
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