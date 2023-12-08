import { EventEmitter } from "events";
import { GetEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { ValidationChain, param } from "express-validator";
import { RequestData } from "../../types/RequestData";
import { findShowByIdWithMetadata, normalizeShow } from "../../lib/queries/showQueries";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { ShowResponse } from "../shows/types/ShowResponse";

interface Param {
  id: number;
}

export class GetShowInfo extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/:id', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }

  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<ShowResponse> {
    const show = await findShowByIdWithMetadata(this.repository, data.params.id);
    if (show === null) {
      throw new NotFoundException('Show not found');
    }
    return normalizeShow(show);
  }
}