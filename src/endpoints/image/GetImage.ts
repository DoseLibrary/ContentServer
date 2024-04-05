import { EventEmitter } from 'events';
import { ValidationChain, param, query } from "express-validator";
import { GetEndpoint, ResponseType } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import sharp from 'sharp';
import { NotFoundException } from '../../exceptions/NotFoundException';
import stream, { Readable } from 'stream';
import { Log } from '../../lib/Logger';
import { ImageRepository } from '../../repositories/ImageRepository';

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
  constructor(emitter: EventEmitter) {
    super('/:id', emitter);
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
    const image = await ImageRepository.findOneById(id);
    if (image === null) {
      throw new NotFoundException('Image not found');
    }

    const buffer = Buffer.from(image.data, 'base64');
    if (data.query.size === Size.ORIGINAL) {
      return Readable.from(buffer);
    }

    return sharp(buffer)
      .metadata()
      .then(({ width }) => {
        if (width === undefined) {
          Log.warning(`Could not resize scale ${image.id}. Using original`);
          return Readable.from(buffer);
        } else {
          return sharp(buffer)
            .resize(Math.round(width * this.getScaleFactor(size)))
            .png();
        }
      });
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