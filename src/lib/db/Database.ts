import pgPromise, { IInitOptions, IDatabase } from 'pg-promise';
import { CategoryRepo, IExtensions, MovieMetadataRepo, MovieRepo, SerieMetadataRepo, UserMovieWatchlistRepo, UserRepo } from './repos';

type ExtendedProtocol = IDatabase<IExtensions> & IExtensions;

export class Database {
  private _db: ExtendedProtocol;

  constructor(user: string, password: string, host: string, port: string, database: string) {
    const pgp = pgPromise(this.initOptions);
    this._db = pgp(`postgres://${user}:${password}@${host}:${port}/${database}`);
  }

  public get connection() {
    return this._db;
  }

  private get initOptions(): IInitOptions {
    return {
      extend(db: ExtendedProtocol, dc: any) {
        db.user = new UserRepo(db, pgPromise());
        db.category = new CategoryRepo(db, pgPromise());
        db.movieMetadata = new MovieMetadataRepo(db, pgPromise());
        db.serieMetadata = new SerieMetadataRepo(db, pgPromise());
        db.userMovieWatchlist = new UserMovieWatchlistRepo(db, pgPromise());
        db.movieRepo = new MovieRepo(db, pgPromise());
      }
    }
  }
}