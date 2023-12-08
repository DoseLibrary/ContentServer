import { ImageType, Prisma } from "@prisma/client";
import { RepositoryManager } from "../repository";
import { ShowResponse } from "../../endpoints/shows/types/ShowResponse";
import { cleanDate } from "../../util/date";

const showWithMetadataQuery = {
  showMetadata: {
    include: {
      images: {
        select: {
          id: true,
          type: true
        }
      },
      genres: true,
    }
  },
  seasons: {
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
      }
    }
  }
}

export enum ShowOrderBy {
  ADDED_DATE = 'addedDate',
  RELEASE_DATE = 'releaseDate'
}

export interface ShowOrderByOptions {
  field: ShowOrderBy;
  dir: 'asc' | 'desc'
}

const createOrderBy = (data?: ShowOrderByOptions): Prisma.ShowOrderByWithRelationInput | undefined => {
  switch (data?.field) {
    case ShowOrderBy.ADDED_DATE:
      return {
        addedDate: data.dir
      }
    case ShowOrderBy.RELEASE_DATE:
      return {
        showMetadata: {
          firstAirDate: data.dir
        }
      }
  }
}

export const listShowsWithMetadata = (
  repository: RepositoryManager,
  orderBy?: ShowOrderByOptions,
  limit?: number,
  offset?: number
) => {
  return repository.show.list(
    {
      include: showWithMetadataQuery,
      orderBy: createOrderBy(orderBy)
    },
    limit,
    offset
  )
}

export const listShowsByTitleWithMetadata = (
  repository: RepositoryManager,
  title: string,
) => {
  return repository.show.findByTitle(title, {
    include: showWithMetadataQuery
  });
}

export const listShowsByGenreWithMetadata = (
  repository: RepositoryManager,
  genre: string,
  orderBy?: ShowOrderByOptions,
  limit?: number,
  offset?: number
) => {
  return repository.show.list(
    {
      include: showWithMetadataQuery,
      where: {
        showMetadata: {
          genres: {
            some: {
              name: genre
            }
          }
        }
      },
      orderBy: createOrderBy(orderBy)
    },
    limit,
    offset
  )
}

export const findShowByIdWithMetadata = (repository: RepositoryManager, id: number) => {
  return repository.show.findById(id, {
    include: showWithMetadataQuery
  })
}

export const normalizeShow = (show: Awaited<ReturnType<typeof findShowByIdWithMetadata>>): ShowResponse => {
  if (show === null) {
    throw new Error('Show was null');
  }
  return normalizeShows([show])[0];
}
export const normalizeShows = (shows: Awaited<ReturnType<typeof listShowsWithMetadata>>): ShowResponse[] => {
  return shows.map(show => ({
    id: show.id,
    title: show.showMetadata?.title || show.name,
    overview: show.showMetadata?.overview,
    firstAirDate: cleanDate(show.showMetadata?.firstAirDate),
    addedDate: cleanDate(show.addedDate),
    genres: show.showMetadata?.genres?.map(genre => genre.name),
    posterId: show.showMetadata?.images?.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: show.showMetadata?.images?.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: show.showMetadata?.images?.find(image => image.type === ImageType.LOGO)?.id,
    seasons: show.seasons.map(season => ({
      title: season.seasonMetadata?.name,
      number: season.seasonMetadata?.seasonNumber || season.seasonNumber,
      posterId: season.seasonMetadata?.images?.find(image => image.type === ImageType.POSTER)?.id
    }))
  }));
}