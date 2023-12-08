import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseType } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import sharp from 'sharp';
import { NotFoundException } from '../../exceptions/NotFoundException';
import fs from 'fs';
import stream from 'stream';
import { Log } from '../../lib/Logger';
import { ImageSource } from '@prisma/client';
import { TmdbImageClient } from '../../lib/api/tmdb/TmdbImageClient';

enum Size {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ORIGINAL = 'original'
}

interface Params {
  id: number;
}

interface Query {
  size: Size;
}

export class GetImageEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id', emitter, repository);
    this.setResponseType(ResponseType.STREAM);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt().toInt(),
      query('size').default(Size.ORIGINAL).isIn(Object.values(Size))
    ];
  }
  protected async execute(data: RequestData<unknown, Query, Params>): Promise<stream> {
    const { id } = data.params;
    const { size } = data.query;
    const image = await this.repository.image.findById(id);
    if (image === null) {
      throw new NotFoundException('Image not found');
    }

    if (image.source !== ImageSource.INTERNAL) {
      const downloaded = await this.downloadExternalImage(image.path, size, image.source);
      return sharp(downloaded);
    }

    if (data.query.size === Size.ORIGINAL) {
      return fs.createReadStream(image.path);
    }

    return sharp(image.path)
      .metadata()
      .then(({ width }) => {
        if (width === undefined) {
          Log.warning(`Could not resize scale ${image.path}. Using original`);
          return fs.createReadStream(image.path)
        } else {
          return sharp(image.path)
            .resize(Math.round(width * this.getScaleFactor(size)))
            .png();
        }
      });
  }

  private downloadExternalImage(url: string, size: Size, source: ImageSource) {
    switch (source) {
      case ImageSource.TMDB:
        const imageClient = new TmdbImageClient('19065a8218d4c104a51afcc3e2a9b971');
        return imageClient.downloadImage(url, this.getQualityParam(size, source));
      default:
        throw new Error(`${source} is not a valid image source`);
    }
  }

  private getQualityParam(size: Size, source: ImageSource) {
    switch (source) {
      case ImageSource.TMDB:
        if (size === Size.ORIGINAL) {
          return 'original';
        }
        return 'w500'; // TODO: Implement more sizes
      default:
        throw new Error(`${source} is not a valid image source`);
    }
  }

  private getScaleFactor(size: Size) {
    switch (size) {
      case Size.SMALL:
        return 0.25;
      case Size.MEDIUM:
        return 0.50;
      case Size.LARGE:
        return 0.75;
      default:
        Log.warning(`Unrecognized image size: ${size}`);
        return 1.00;
    }
  }

}