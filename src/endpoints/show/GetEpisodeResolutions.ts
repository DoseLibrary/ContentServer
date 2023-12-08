import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from '../../lib/Endpoint';
import { RepositoryManager } from '../../lib/repository';
import { RequestData } from '../../types/RequestData';
import { getAudioCodecsFromStreams, getVideoCodecFromStreams, getVideoMetadata, getVideoResolutionsFromStreams } from '../../util/video';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { createClientFromUserAgent } from '../../lib/clients';
import { AvailableResolutions } from '../../types/AvailableResolutions';
import { getEpisodePathById } from '../../lib/queries/episodeQueries';

interface Param {
  id: number;
}

// TODO: This endpoint is using the internal episode id, not showId, seasonNumber, episodeNumber
// The frontend should be updated to support showId, seasonNumber, episodeNumber instead of episodeId
export class GetEpisodeResolutionsEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/episode/:id/resolutions', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableResolutions> {
    const episodePath = await getEpisodePathById(this.repository, data.params.id);
    if (!episodePath) {
      throw new NotFoundException('Movie not found');
    }

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