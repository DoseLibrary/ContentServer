import { PrismaClient } from '@prisma/client'
import express, { Express, NextFunction, Request, Response, Router } from 'express';
import cors from 'cors';
import http, { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { EventEmitter } from 'events';
import { Config } from './lib/Config';
import * as path from 'path';
import { RouterPath } from './types/RouterPath';
import HttpException from './exceptions/HttpException';
import { createMoviesEndpoints } from './endpoints/movies';
import { Watcher } from './lib/Watcher';
import { RepositoryManager, createRepositories } from './lib/repository';
import { createAuthEndpoints } from './endpoints/auth';
import { Job } from './lib/job/Job';
import { PopularMovieJob } from './lib/job/PopularMovieJob';
import { createUserEndpoints } from './endpoints/user';
import { createShowsEndpoints } from './endpoints/shows';
import { createPingEndpoints } from './endpoints/ping';
import { createImageEndpoints } from './endpoints/image';
import { ScanForTrailerJob } from './lib/job/ScanForTrailersJob';
import { createMovieEndpoints } from './endpoints/movie';
import { createGenreEndpoints } from './endpoints/genre';
import { createVideoEndpoints } from './endpoints/video';
import transcodingManager from './lib/transcodings/TranscodingManager';
import { createMetadataEndpoints } from './endpoints/metadata';
import { createShowEndpoints } from './endpoints/show';
import { ExtractSubtitlesJob } from './lib/job/ExtractSubtitlesJob';
import { createSearchEndpoints } from './endpoints/search';

export class Server {
  private app: Express;
  private server: HttpServer;
  private io: IOServer;
  private config: Config;
  private watcher: Watcher;
  private repository: RepositoryManager;
  private jobs: Job[];
  private emitter: EventEmitter;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.setupMiddlewares();
    this.io = new IOServer(this.server);
    this.jobs = [];
    this.emitter = new EventEmitter();

    const configPath = path.join(process.env.TEMP_DIRECTORY || '', 'config.json');
    this.config = new Config(configPath);
    transcodingManager.setConfig(this.config);
    this.repository = createRepositories(new PrismaClient(), this.config);
    this.watcher = new Watcher(this.repository);
  }

  private setupEndpoints() {
    const endpoints: RouterPath[] = [
      createPingEndpoints(this.config, this.emitter, this.repository),
      createImageEndpoints(this.config, this.emitter, this.repository),
      createAuthEndpoints(this.config, this.emitter, this.repository),
      createMoviesEndpoints(this.config, this.emitter, this.repository),
      createMovieEndpoints(this.config, this.emitter, this.repository),
      createGenreEndpoints(this.config, this.emitter, this.repository),
      createShowsEndpoints(this.config, this.emitter, this.repository),
      createShowEndpoints(this.config, this.emitter, this.repository),
      createUserEndpoints(this.config, this.emitter, this.repository),
      createVideoEndpoints(this.config, this.emitter, this.repository),
      createMetadataEndpoints(this.config, this.emitter, this.repository),
      createSearchEndpoints(this.config, this.emitter, this.repository)
    ];
    const apiRouter = Router();
    endpoints.forEach(({ router, path }) => apiRouter.use(path, router));
    this.app.use('/api', apiRouter);
  }

  private setupMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  // Always call this function after all other endpoints/middlewares have been setup
  private setupErrorHandling() {
    // 404
    this.app.all('*', (req: Request, res: Response) => {
      res.status(404).json({
        message: '404 not found'
      });
    });

    // Thrown errors
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof HttpException) {
        res.status(err.status).json({
          message: err.message,
          additionalInfo: err.info
        });
      } else {
        console.log('Unknown error detected', err);
        res.status(500).json({
          message: 'An unknown error occured'
        });
      }
    });
  }

  private setupJobs() {
    this.jobs.push(
      new PopularMovieJob(this.repository),
      new ScanForTrailerJob(this.repository),
      new ExtractSubtitlesJob(this.repository, this.emitter)
    );
    this.jobs.map(job => job.start());
  }

  async start(port: number) {
    this.setupEndpoints();
    this.setupErrorHandling();
    this.server.listen(port);
    this.watcher.start(this.emitter);
    this.setupJobs();
  }
}