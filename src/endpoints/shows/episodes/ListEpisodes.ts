import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { normalizeBasicEpisodes } from '../../../lib/queries/episodeQueries';
import { EpisodeRepository } from '../../../repositories/EpisodeRepository';
import { BasicEpisodeResponse } from '../../../types/episode/BasicEpisodeResponse';

interface QueryParams {
  limit: number;
  offset: number;
}

export class ListEpisodes extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/list/episodes', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<BasicEpisodeResponse[]> {
    const orderBy = undefined;
    const { limit, offset } = data.query;
    const episodes = await EpisodeRepository.find({
      take: limit,
      skip: offset,
      relations: ['season', 'season.metadata', 'season.show', 'season.show.metadata']
    });
    return normalizeBasicEpisodes(episodes);
  }
}
