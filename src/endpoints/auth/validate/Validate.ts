import { ValidationChain, body } from 'express-validator';
import { PostEndpoint } from "../../../lib/Endpoint";
import { EventEmitter } from 'events';
import { signJwt } from '../../../util/security';
import { RequestData } from '../../../types/RequestData';
import { UserRepository } from '../../../repositories/UserRepository';

interface ValidateResult {
  status: string
}

interface ValidateRequest {
  token: string;
};

interface MainServerResponse {
  valid: boolean,
  username: string
};

const isMainServerResponse = (obj: unknown): obj is MainServerResponse => {
  const data = obj as MainServerResponse;
  return data && typeof data.valid === 'boolean' && typeof data.username === 'string';
}

export class ValidateEndpoint extends PostEndpoint {
  constructor(emitter: EventEmitter) {
    super('/', emitter);
    this.setAuthRequired(false);
  }

  getValidator(): ValidationChain[] {
    return [
      body('token', 'Token has to be a valid JWT').isJWT()
    ];
  }


  execute(requestData: RequestData<ValidateRequest>) {
    return fetch(`${this.config.mainServer}/api/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: requestData.body.token
      })
    }).then(r => r.json())
      .then(data => {
        if (!isMainServerResponse(data)) {
          throw new Error('Invalid main server response');
        }
        if (!data.valid || !data.username) {
          throw new Error('Invalid token');
        }
        return data;
      })
      .then(data => UserRepository.findOneByUsername(data.username))
      .then(user => {
        if (user === null) {
          throw new Error('User not found');
        }
        if (!user.hasAccess) {
          throw new Error('User does not have access');
        }

        const { token, validTo } = signJwt(user.username, user.id);
        return {
          status: 'success',
          token,
          validTo
        };
      })
      .catch(err => {
        return {
          status: 'error',
          error: err.message || JSON.stringify(err)
        };
      })
  }
}
