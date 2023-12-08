import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { EpisodeResponse } from "../shows/types/EpisodeResponse";
import { getEpisodeWithMetadata, normalizeEpisode } from "../../lib/queries/episodeQueries";
import { NotFoundException } from "../../exceptions/NotFoundException";

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

export class GetEpisodeInfo extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:showId/season/:seasonNumber/episode/:episodeNumber', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<EpisodeResponse> {
    const { showId, seasonNumber, episodeNumber } = data.params;
    const episode = await getEpisodeWithMetadata(this.repository, showId, seasonNumber, episodeNumber);
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return normalizeEpisode(episode);
  }
}