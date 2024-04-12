import { EventEmitter } from 'events';
import { GetEndpoint } from "../../lib/Endpoint";
import { ValidationChain } from 'express-validator';
import { UserRepository } from '../../repositories/UserRepository';


export class IsClaimedEndpoint extends GetEndpoint {
  constructor(emitter: EventEmitter) {
    super('/claimed', emitter);
    this.setAuthRequired(false);
  }

  protected getValidator(): ValidationChain[] {
    return []
  }
  protected async execute(): Promise<{ claimed: boolean }> {
    console.log(UserRepository.adminExists());
    return { claimed: UserRepository.adminExists() };
  }
}