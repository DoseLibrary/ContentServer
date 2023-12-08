import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../types/RequestData";

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

interface NextEpisode {
  id?: number;
  season?: number;
  episode?: number;
  found: boolean;
}

export class GetNextEpisode extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:showId/season/:seasonNumber/episode/:episodeNumber/next', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<NextEpisode> {
    const { showId, seasonNumber, episodeNumber } = data.params;
    let nextEpisode = await this.repository.episode.findByEpisodeInSeason(
      episodeNumber + 1,
      seasonNumber,
      showId
    );

    // If next episode not found in this season, try to find it in the next season
    if (!nextEpisode) {
      nextEpisode = await this.repository.episode.findByEpisodeInSeason(1, seasonNumber + 1, showId);
    }

    return nextEpisode ? {
      id: nextEpisode.id,
      season: nextEpisode.seasonNumber,
      episode: nextEpisode.episodeNumber,
      found: true
    } : {
      found: false
    };
  }
}