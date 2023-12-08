import { EventEmitter } from "events";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RepositoryManager } from "../../../lib/repository";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../../types/RequestData";
import { listOngoingEpisodes } from "../../../lib/queries/userQueries";

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

export class GetUserEpisodeData extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/show/:showId/season/:seasonNumber/episode/:episodeNumber', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<unknown> {
    const { showId, seasonNumber, episodeNumber } = data.params;
    const ongoingEpisodes = await listOngoingEpisodes(this.repository, data.userId);

    const ongoingEpisode = ongoingEpisodes.find(episode =>
      episode.showId === showId &&
      episode.seasonNumber === seasonNumber &&
      episode.episodeNumber === episodeNumber
    );

    return {
      lastWatched: ongoingEpisode?.lastWatched,
      timeWatched: ongoingEpisode?.timeWatched
    }
  }
}