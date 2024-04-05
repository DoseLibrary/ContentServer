import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { normalizeBasicEpisode } from '../../../lib/queries/episodeQueries';
import { UserOngoingEpisodeRepository } from '../../../repositories/UserOngoingEpisodeRepository';
import { BasicEpisodeWithUserProgressResponse } from '../../../types/episode/BasicEpisodeResponse';
import { cleanDate } from '../../../util/date';

interface QueryParams {
  limit: number;
  offset: number;
}

export class ListOngoingEpisodes extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/ongoing/episodes', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicEpisodeWithUserProgressResponse[]> {
    const { limit, offset } = data.query;
    const entities = await UserOngoingEpisodeRepository.findOngoingEpisodesByUserId(data.userId, {
      take: limit,
      skip: offset,
      relations: ['episode', 'episode.season', 'episode.season.show', 'episode.season.metadata', 'episode.season.show.metadata']
    });
    return entities.map(entity => ({
      ...normalizeBasicEpisode(entity.episode),
      progress: entity.time,
      lastWatched: cleanDate(entity.lastWatched)
    }));
  }
}