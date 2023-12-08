import { RepositoryManager } from "../repository";
import { episodeWithMetadataQuery } from "./episodeQueries";
import { movieWithMetadataQuery } from "./movieQueries";

export const listOngoingMovies = (repository: RepositoryManager, userId: number, limit?: number, offset: number = 0) => {
  return repository.user.listOngoingMovies(
    movieWithMetadataQuery,
    userId,
    limit,
    offset
  );
}

export const getUserWatchlist = (repository: RepositoryManager, userId: number, limit?: number, offset: number = 0) => {
  return repository.user.listWatchlist(
    movieWithMetadataQuery,
    userId,
    limit,
    offset
  );
}

export const getWatchedMovies = (repository: RepositoryManager, userId: number, limit?: number, offset: number = 0) => {
  return repository.user.listWatchedMovies(
    movieWithMetadataQuery,
    userId,
    limit,
    offset
  );
}

export const listOngoingEpisodes = (repository: RepositoryManager, userId: number, limit?: number, offset: number = 0) => {
  return repository.user.listOngoingEpisodes(
    episodeWithMetadataQuery,
    userId,
    limit,
    offset
  );
}