import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { RequestData } from "../../types/RequestData";
import { getSeasonInfoWithMetadata, normalizeSeason } from "../../lib/queries/seasonQueries";
import { SeasonResponse } from "../shows/types/SeasonResponse";
import { NotFoundException } from "../../exceptions/NotFoundException";

interface Param {
  showId: number;
  seasonNumber: number;
}

export class GetSeasonInfo extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:showId/season/:seasonNumber', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<SeasonResponse> {
    const { showId, seasonNumber } = data.params;

    const season = await getSeasonInfoWithMetadata(this.repository, showId, seasonNumber);
    if (season === null) {
      throw new NotFoundException('Season not found');
    }
    return normalizeSeason(season);
  }
}