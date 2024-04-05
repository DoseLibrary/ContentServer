import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { normalizeDetailedEpisode } from "../../lib/queries/episodeQueries";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { EpisodeRepository } from "../../repositories/EpisodeRepository";
import { DetailedEpisodeResponse } from "../../types/episode/DetailedEpisodeResponse";

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

export class GetEpisodeInfo extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:showId/season/:seasonNumber/episode/:episodeNumber', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ];
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<DetailedEpisodeResponse> {
    const { showId, seasonNumber, episodeNumber } = data.params;
    const episode = await EpisodeRepository.findOneByEpisodeInSeason(showId, seasonNumber, episodeNumber, {
      relations: ['season', 'season.show', 'season.metadata', 'season.show.metadata']
    });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }
    return normalizeDetailedEpisode(episode);
  }
}