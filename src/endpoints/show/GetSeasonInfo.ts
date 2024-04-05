import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { normalizeDetailedSeason } from "../../lib/queries/seasonQueries";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { SeasonRepository } from "../../repositories/SeasonRepository";
import { DetailedSeasonResponse } from "../../types/season/DetailedSeasonResponse";

interface Param {
  showId: number;
  seasonNumber: number;
}

export class GetSeasonInfo extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:showId/season/:seasonNumber', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<DetailedSeasonResponse> {
    const { showId, seasonNumber } = data.params;
    const season = await SeasonRepository.findOneBySeasonInShow(showId, seasonNumber, {
      relations: ['show', 'show.metadata']
    });
    if (season === null) {
      throw new NotFoundException('Season not found');
    }
    return normalizeDetailedSeason(season);
  }
}