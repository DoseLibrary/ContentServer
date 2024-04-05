import { EventEmitter } from 'events';
import { Router, Request, Response, NextFunction } from 'express';
import { ValidationChain, ValidationError, validationResult } from 'express-validator';
import { Config } from './Config';
import { isAuthorized } from '../middlewares/AuthMiddleware';
import { BadRequestException } from '../exceptions/BadRequestException';
import { RequestData } from '../types/RequestData';
import { isString } from '../util/string';
import stream from 'stream';
import { Log } from './Logger';
import * as isStream from 'is-stream';
import { parseUserAgent } from '../util/http';

export enum EndpointType {
  GET,
  POST,
  DELETE,
  PUT
};

export enum ResponseType {
  FILE = 'file',
  STREAM = 'stream',
  JSON = 'json'
}

export interface ResponseHeaders {
  headers: Headers;
  status: number;
}

abstract class Endpoint {
  protected config: Config;
  protected emitter: EventEmitter;

  private authRequired: boolean = true;
  private path: string;
  private type: EndpointType;
  private responseType: ResponseType = ResponseType.JSON;

  constructor(path: string, emitter: EventEmitter, type: EndpointType) {
    this.path = path;
    this.emitter = emitter;
    this.type = type;
  }

  public setupEndpoint(router: Router, config: Config) {
    this.config = config;
    switch (this.type) {
      case EndpointType.GET:
        router.get(this.path, ...this.getValidator(), this.runAuthIfNeeded.bind(this), this.process.bind(this));
        break;
      case EndpointType.POST:
        router.post(this.path, ...this.getValidator(), this.runAuthIfNeeded.bind(this), this.process.bind(this));
        break;
      case EndpointType.DELETE:
        router.delete(this.path, ...this.getValidator(), this.runAuthIfNeeded.bind(this), this.process.bind(this));
        break;
      case EndpointType.PUT:
        router.put(this.path, ...this.getValidator(), this.runAuthIfNeeded.bind(this), this.process.bind(this));
        break;
    }
  }

  protected setAuthRequired(value: boolean) {
    this.authRequired = value;
  }

  protected setResponseType(value: ResponseType) {
    this.responseType = value;
  }

  /**
   * Function called to get the validation settings for the request
   */
  protected abstract getValidator(): ValidationChain[];

  /**
   * Function called when the server receives a request
   * @param body Express request body
   * @param query Express request query
   * @param userId The validated userId, undefined if authRequired is set to false
   */
  protected abstract execute(data: RequestData): Promise<unknown> | unknown;

  /**
   * Function called when the server needs to set status code and headers. Can be overloaded
   */
  protected async headers(data: RequestData): Promise<ResponseHeaders> {
    return {
      headers: new Headers(),
      status: 200
    }
  }

  /**
   * Called when a file is sent to the client, can be overloaded
   * @param file The file that was sent
   * @returns 
   */
  protected async fileSent(file: string): Promise<void> {
    return;
  }

  private setHeaders(res: Response, status: number, headers: Headers) {
    res.statusCode = status;
    Array.from(headers).map(([ key, value ]) => res.setHeader(key, value));
  }

  private async process(req: Request, res: Response, next: NextFunction) {
    const validationErrors = this.getValidationErrors(req);
    try {
      if (validationErrors.length > 0) {
        throw new BadRequestException(validationErrors);
      } else {
        const data: RequestData = {
          body: req.body,
          query: req.query,
          params: req.params,
          headers: req.headers,
          userAgent: parseUserAgent(req.headers['user-agent'] || ''),
          userId: res.locals.userId || undefined
        };

        const responseHeaders = await this.headers(data);
        this.setHeaders(res, responseHeaders.status, responseHeaders.headers);
        const result = await this.execute(data);
        this.sendResponse(result, res);
      }
    } catch (err) {
      next(err);
    }
  }

  private sendResponse(data: unknown, res: Response) {
    switch (this.responseType) {
      case ResponseType.JSON:
        res.send(data);
        break;
      case ResponseType.FILE:
        if (!isString(data)) {
          throw new Error(`Expected data to be a string`);
        }
        res.sendFile(data, (err: Error) => {
          if (err) {
            Log.error(`Error sending file ${err}`);
          }
          this.fileSent(data);
        });
        break;
      case ResponseType.STREAM:
        const passThrough = new stream.PassThrough();
        if (!isStream.readable(data)) {
          throw new Error('Expected data to be a readable stream');
        }
        stream.pipeline(
          data,
          passThrough,
          (err: unknown): void => {
            if (err) {
              Log.error(`Error writing stream in image endpoint`);
              Log.error(err);
              throw new Error(`Error writing stream in image endpoint`);
            }
          }
        );
        passThrough.pipe(res);
        break;
      default:
        throw new Error(`${this.responseType} is not implemented`);
    }
  }

  private getValidationErrors(req: Request): ValidationError[] {
    const result = validationResult(req);
    return result.array();
  }

  private runAuthIfNeeded(req: Request, res: Response, next: NextFunction) {
    if (this.authRequired) {
      isAuthorized(req, res, next);
    } else {
      next();
    }
  }
}

// Overide execute here, should not get reqbody
export abstract class GetEndpoint extends Endpoint {
  constructor(path: string = '/', emitter: EventEmitter) {
    super(path, emitter, EndpointType.GET);
  }
}

export abstract class PostEndpoint extends Endpoint {
  constructor(path: string = '/', emitter: EventEmitter) {
    super(path, emitter, EndpointType.POST);
  }
}

export abstract class DeleteEndpoint extends Endpoint {
  constructor(path: string = '/', emitter: EventEmitter) {
    super(path, emitter, EndpointType.DELETE);
  }
}

export abstract class PutEndpoint extends Endpoint {
  constructor(path: string = '/', emitter: EventEmitter) {
    super(path, emitter, EndpointType.PUT);
  }
}