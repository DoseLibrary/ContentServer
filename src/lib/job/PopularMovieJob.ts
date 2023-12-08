import { MetadataClient } from "../api/MetadataClient";
import { TmdbMetadataClient } from "../api/tmdb/TmdbMetadataClient";
import { RepositoryManager } from "../repository";
import { Job } from "./Job";

export class PopularMovieJob extends Job {
  private metadataClient: MetadataClient;
  private repository: RepositoryManager;

  constructor(repository: RepositoryManager) {
    super({
      intervalMs: 43200000, // Every 12 hour
      runAtStart: true,
      useInterval: true
    })
    this.repository = repository;
    this.metadataClient = new TmdbMetadataClient('19065a8218d4c104a51afcc3e2a9b971'); // TODO: Centralize this api-key
  }

  protected async execute(): Promise<void> {
    await this.repository.movie.resetAllPopular();
    const popularMovieIds = await this.metadataClient.getPopularMovieIds();
    const movies = await this.repository.movie.findByExternalIds(popularMovieIds);
    await Promise.all(movies.map(movie => this.repository.movie.setPopular(movie.id, true)));
  }
}