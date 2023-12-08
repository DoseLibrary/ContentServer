import { EventEmitter } from "events";
import { ValidationChain, param, query } from "express-validator";
import { PutEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from "../../exceptions/NotFoundException";

enum Type {
  MOVIE = 'movie',
  EPISODE = 'episode'
}

interface Param {
  type: Type;
  id: number;
}

interface Query {
  time: number;
}

export class UpdateCurrentWatchtimeEndpoint extends PutEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:type/:id/current-time', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('type').isIn(Object.values(Type)),
      param('id').isInt({ min: 0 }).toInt(),
      query('time').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, Query, Param>): Promise<void> {
    const { time } = data.query;
    const { type, id } = data.params;

    try {
      if (type === Type.MOVIE) {
        await this.repository.user.updateOngoingMovie(data.userId, id, time);
      } else {
        const episode = await this.repository.episode.findById(id);
        if (!episode) {
          throw new NotFoundException('Episode not found');
        }
        await this.repository.user.updateOngoingEpisode(data.userId, episode.showId, episode.seasonNumber, episode.episodeNumber, time);
      }
    } catch (error: any) {
      if (error.code === 'P2003') { // TODO: Check if this is the correct error code
        throw new NotFoundException('Not found');
      }
      throw error;
    }
  }
}