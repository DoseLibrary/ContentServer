import { ImageType, Prisma } from "@prisma/client";
import { RepositoryManager } from "../repository";
import { EpisodeResponse } from "../../endpoints/shows/types/EpisodeResponse";
import { cleanDate } from "../../util/date";
import path from 'path';

export const episodeWithMetadataQuery = {
  metadata: {
    include: {
      images: {
        select: {
          id: true,
          type: true
        }
      }
    }
  },
  season: {
    include: {
      seasonMetadata: {
        include: {
          images: {
            select: {
              id: true,
              type: true
            }
          }
        }
      },
      show: {
        include: {
          showMetadata: {
            include: {
              images: {
                select: {
                  id: true,
                  type: true
                }
              }
            }
          }
        }
      }
    }
  }
}

enum EpisodeOrderBy {
  ADDED_DATE = 'addedDate',
  RELEASE_DATE = 'releaseDate'
}

export interface EpisodeOrderByOptions {
  field: EpisodeOrderBy;
  dir: 'asc' | 'desc'
}

const createOrderBy = (data?: EpisodeOrderByOptions): Prisma.EpisodeOrderByWithRelationInput | undefined => {
  switch (data?.field) {
    case EpisodeOrderBy.ADDED_DATE:
      return {
        addedDate: data.dir
      }
    case EpisodeOrderBy.RELEASE_DATE:
      return {
        metadata: {
          airDate: data.dir
        }
      }
  }
}

export const listEpisodesWithMetadata = (
  repository: RepositoryManager,
  orderBy?: EpisodeOrderByOptions,
  limit?: number,
  offset?: number
) => {
  return repository.episode.list(
    {
      include: episodeWithMetadataQuery,
      orderBy: createOrderBy(orderBy)
    },
    limit,
    offset
  );
}

export const getEpisodeWithMetadata = (
  repository: RepositoryManager,
  showId: number,
  seasonNumber: number,
  episodeNumber: number
) => {
  return repository.episode.findByEpisodeInSeason(
    episodeNumber,
    seasonNumber,
    showId,
    {
      include: episodeWithMetadataQuery
    }
  );
}

export const getEpisodePathById = (repository: RepositoryManager, id: number) => {
  return repository.episode.findById(id, {
    include: {
      season: {
        select: {
          show: {
            select: {
              library: {
                select: {
                  path: true
                }
              }
            }
          }
        }
      }
    }
  }).then(episode =>
    episode ? path.join(episode.season.show.library.path, episode.path) : undefined);
}

export const getLibraryPathByEpisodeId = (repository: RepositoryManager, id: number) => {
  return repository.episode.findById(id, {
    include: {
      season: {
        select: {
          show: {
            select: {
              library: {
                select: {
                  path: true
                }
              }
            }
          }
        }
      }
    }
  }).then(episode => episode?.season.show.library.path || undefined);
}

export const normalizeEpisode = (episode: Awaited<ReturnType<typeof getEpisodeWithMetadata>>): EpisodeResponse => {
  if (!episode) {
    throw new Error('Episode was null');
  }
  return normalizeEpisodes([episode])[0];
}
export const normalizeEpisodes = (episodes: Awaited<ReturnType<typeof listEpisodesWithMetadata>>): EpisodeResponse[] => {
  return episodes.map(episode => ({
    id: episode.id,
    showId: episode.showId,
    season: episode.metadata?.seasonNumber || episode.seasonNumber,
    episode: episode.metadata?.episodeNumber || episode.episodeNumber,
    title: episode.metadata?.name,
    overview: episode.metadata?.overview,
    addedDate: cleanDate(episode.addedDate),
    airDate: cleanDate(episode.metadata?.airDate),
    duration: episode.duration || undefined,
    posterId: episode.metadata?.images.find(image => image.type === ImageType.POSTER)?.id ||
      episode.season.seasonMetadata?.images.find(image => image.type === ImageType.POSTER)?.id ||
      episode.season.show.showMetadata?.images.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: episode.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id ||
      episode.season.seasonMetadata?.images.find(image => image.type === ImageType.BACKDROP)?.id ||
      episode.season.show.showMetadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: episode.metadata?.images.find(image => image.type === ImageType.LOGO)?.id,
  }))
};