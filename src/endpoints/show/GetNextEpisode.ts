import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { EpisodeRepository } from "../../repositories/EpisodeRepository";

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

interface NextEpisode {
  season?: number;
  episode?: number;
  found: boolean;
}

export class GetNextEpisode extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:showId/season/:seasonNumber/episode/:episodeNumber/next', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<NextEpisode> {
    // TODO: This is weird, if you have episode 1 and 2 in season one and you request episode 3, it will return episode 1 of season 2.
    // Even though episode 3 exists, just that we don't have it. Maybe we should do a request to TMDB?
    const { showId, seasonNumber, episodeNumber } = data.params;
    let nextEpisode = await EpisodeRepository.findOneByEpisodeInSeason(
      episodeNumber + 1,
      seasonNumber,
      showId
    );
    // If next episode not found in this season, try to find it in the next season
    if (!nextEpisode) {
      nextEpisode = await EpisodeRepository.findOneByEpisodeInSeason(
        1,
        seasonNumber + 1,
        showId
      );
    }

    return nextEpisode ? {
      season: nextEpisode.seasonNumber,
      episode: nextEpisode.episodeNumber,
      found: true
    } : {
      found: false
    };
  }
}