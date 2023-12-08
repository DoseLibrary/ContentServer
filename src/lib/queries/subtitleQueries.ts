import { RepositoryManager } from "../repository";
import path from 'path'; import { getLibraryPathByEpisodeId } from "./episodeQueries";
import { getLibraryPathByMovieId } from "./movieQueries";

const getLibraryPath = (
  repository: RepositoryManager,
  movieId: number | null,
  episodeId: number | null
) => {
  if (movieId) {
    return getLibraryPathByMovieId(repository, movieId);
  }
  if (episodeId) {
    return getLibraryPathByEpisodeId(repository, episodeId);
  }
  return undefined;
}

export const getSubtitleFullPathById = async (
  repository: RepositoryManager,
  id: number
): Promise<string | undefined> => {
  const subtitle = await repository.subtitle.findById(id);
  if (!subtitle) {
    return undefined;
  }

  const libraryPath = await getLibraryPath(repository, subtitle.movieId, subtitle.episodeId);
  if (!libraryPath) {
    throw new Error('Library path was undefined');
  }
  return path.join(libraryPath, subtitle.path);
}