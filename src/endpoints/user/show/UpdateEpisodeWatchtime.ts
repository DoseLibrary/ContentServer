import { EventEmitter } from "events";
import { PutEndpoint } from "../../../lib/Endpoint";
import { ValidationChain, param, query } from "express-validator";
import { RequestData } from "../../../types/RequestData";
import { UserOngoingEpisodeRepository } from "../../../repositories/UserOngoingEpisodeRepository";
import { EpisodeRepository } from "../../../repositories/EpisodeRepository";
import { NotFoundException } from "../../../exceptions/NotFoundException";

interface Param {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

interface Query {
  time: number;
}

export class UpdateEpisodeWatchtimeEndpoint extends PutEndpoint {
  constructor(emitter: EventEmitter) {
    super('/show/:showId/season/:seasonNumber/episode/:episodeNumber/watchtime', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('showId').isInt({ min: 0 }).toInt(),
      param('seasonNumber').isInt({ min: 0 }).toInt(),
      param('episodeNumber').isInt({ min: 0 }).toInt(),
      query('time').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<void> {
    const { showId, seasonNumber, episodeNumber } = data.params;
    const { time } = data.query;

    const entity = await UserOngoingEpisodeRepository.findOngoingMovieByUserIdShowIdSeasonNumberEpisodeNumber(
      data.userId,
      showId,
      seasonNumber,
      episodeNumber
    );

    // Not found, create a new one
    if (!entity) {
      const episodeExists = await EpisodeRepository.existsBy({ showId, seasonNumber, episodeNumber });
      if (!episodeExists) {
        throw new NotFoundException('Episode not found');
      }
      await UserOngoingEpisodeRepository.save({
        userId: data.userId,
        showId,
        seasonNumber,
        episodeNumber,
        time,
        lastWatched: new Date(),
      });
    } else {
      entity.time = time;
      entity.lastWatched = new Date();
      await UserOngoingEpisodeRepository.save(entity);
    }
  }
}