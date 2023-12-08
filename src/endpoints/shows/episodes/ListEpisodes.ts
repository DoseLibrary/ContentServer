import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from '../../../lib/repository';
import { ImageType } from '@prisma/client';
import { EpisodeResponse } from '../../shows/types/EpisodeResponse';
import { listEpisodesWithMetadata, normalizeEpisodes } from '../../../lib/queries/episodeQueries';

interface QueryParams {
  limit: number;
  offset: number;
}

export class ListEpisodes extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list/episodes', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      query('limit', 'How many records to return').default(50).isInt({ min: 0 }).toInt(),
      query('offset', 'How many records to skip').default(0).isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, QueryParams, unknown>): Promise<EpisodeResponse[]> {
    const orderBy = undefined;
    const { limit, offset } = data.query;
    const episodes = await listEpisodesWithMetadata(this.repository, orderBy, limit, offset);
    return normalizeEpisodes(episodes);
  }
}