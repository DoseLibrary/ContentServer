import { EventEmitter } from 'events';
import { ValidationChain, query } from "express-validator";
import { GetEndpoint } from '../../lib/Endpoint';
import { RequestData } from '../../types/RequestData';

export class PingEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [];
  }
  protected async execute(data: RequestData<unknown, unknown, unknown>): Promise<void> {
    return;
  }
}