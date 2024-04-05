import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { normalizeDetailedShow } from "../../lib/queries/showQueries";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { ShowRepository } from "../../repositories/ShowRepository";
import { DetailedShowResponse } from "../../types/show/DetailedShowResponse";

interface Param {
  id: number;
}

export class GetShowInfo extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/:id', emitter);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<DetailedShowResponse> {
    const show = await ShowRepository.findById(data.params.id);
    if (show === null) {
      throw new NotFoundException('Show not found');
    }
    return normalizeDetailedShow(show);
  }
}