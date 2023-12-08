import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { ValidationChain, param } from "express-validator";
import { ImageClient, ImageCollection } from "../../lib/api/ImageClient";
import { TmdbImageClient } from "../../lib/api/tmdb/TmdbImageClient";
import { RequestData } from "../../types/RequestData";
import { NotFoundException } from "../../exceptions/NotFoundException";

enum Type {
  MOVIE = 'movie',
  EPISODE = 'episode',
  SEASON = 'season',
  SHOW = 'show'
}

interface Param {
  type: Type;
  id: number;
}

// Not used by frontend
export class ListExternalImagesEndpoint extends GetEndpoint {
  private imageClient: TmdbImageClient;

  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/list/:type/:id/external', emitter, repository);
    this.imageClient = new TmdbImageClient('19065a8218d4c104a51afcc3e2a9b971');
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('type').isIn(Object.values(Type)),
      param('id').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<ImageCollection> {
    const { type, id } = data.params;
    if (type !== Type.MOVIE) {
      throw new Error('Only movies are supported');
    }
    const movie = await this.repository.movie.findById(id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    const includeBaseUrl = true;
    return this.imageClient.getMovieImages(id, includeBaseUrl);
  }
}