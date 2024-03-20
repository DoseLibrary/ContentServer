import { EventEmitter } from 'events';
import { GetEndpoint, PostEndpoint } from "../../lib/Endpoint";
import { RepositoryManager } from "../../lib/repository";
import { ValidationChain, body } from 'express-validator';
import { RequestData } from '../../types/RequestData';

interface Body {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
}

export class TestDatabaseConnection extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/test-database-connection', emitter, repository);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return [
      body('host').isString().notEmpty(),
      body('port').isInt({ min: 0 }).toInt(),
      body('user').isString().notEmpty(),
      body('password').isString().notEmpty(),
      body('name').isString().notEmpty(),
    ]
  }
  protected async execute(data: RequestData<Body, unknown, unknown>): Promise<void> {
    try {
      const { host, port, user, password, name } = data.body;
    } catch (e: any) {
      throw e;
    }
  }
}