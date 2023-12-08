import { ImageType } from "@prisma/client";
import { SeasonResponse } from "../../endpoints/shows/types/SeasonResponse";
import { RepositoryManager } from "../repository";
import { cleanDate } from "../../util/date";

export const getSeasonInfoWithMetadata = (repository: RepositoryManager, showId: number, seasonNumber: number) => {
  return repository.season.findBySeasonInShow(seasonNumber, showId, {
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
    episodes: {
      include: {
        metadata: {
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
  })
}

export const normalizeSeason = (season: Awaited<ReturnType<typeof getSeasonInfoWithMetadata>>): SeasonResponse => {
  if (!season) {
    throw new Error('Season was null');
  }
  return {
    addedDate: cleanDate(season?.addedDate),
    airDate: cleanDate(season?.seasonMetadata?.airDate),
    season: season?.seasonMetadata?.seasonNumber || season?.seasonNumber,
    title: season?.seasonMetadata?.name,
    backdropId: season?.seasonMetadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id ||
      season?.show?.showMetadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id,
    posterId: season?.seasonMetadata?.images?.find(image => image.type === ImageType.POSTER)?.id ||
      season?.show?.showMetadata?.images?.find(image => image.type === ImageType.POSTER)?.id,
    overview: season?.seasonMetadata?.overview,
    episodes: season?.episodes.map(episode => ({
      episode: episode.episodeNumber,
      backdropId: episode.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
      overview: episode.metadata?.overview,
      title: episode.metadata?.name
    })),
    show: {
      title: season.show.showMetadata?.title || season.show.name
    }
  }
}