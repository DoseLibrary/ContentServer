import { EventEmitter } from 'events';
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { AvailableSubtitle } from '../../types/AvailableSubtitle';

interface Param {
  id: number;
}

export class GetMovieSubtitlesEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id/subtitles', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ];
  }
  protected execute(data: RequestData<unknown, unknown, Param>): Promise<AvailableSubtitle[]> {
    return this.repository.movie.getSubtitles(data.params.id)
      .then(subtitles => subtitles.map(subtitle => ({
        id: subtitle.id,
        language: subtitle.language
      })));
  }
}