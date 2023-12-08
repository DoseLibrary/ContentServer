import { ImageType, Prisma } from "@prisma/client";
import { RepositoryManager } from "../repository";
import { MovieResponse } from "../../endpoints/movies/types/MovieResponse";
import path from 'path';
import { cleanDate } from "../../util/date";

export const movieWithMetadataQuery = {
  movieMetadata: {
    include: {
      images: {
        select: {
          id: true,
          type: true
        }
      },
      genres: true
    }
  }
}

const popularMovieSelection = {
  movieMetadata: {
    popular: true
  }
};

const movieByGenreSelection = (genre: string) => ({
  movieMetadata: {
    genres: {
      some: {
        name: genre
      }
    }
  }
});

export enum MovieOrderBy {
  ADDED_DATE = 'addedDate',
  RELEASE_DATE = 'releaseDate'
}

export interface MovieOrderByOptions {
  field: MovieOrderBy;
  dir: 'asc' | 'desc'
}

const createOrderBy = (data?: MovieOrderByOptions): Prisma.MovieOrderByWithRelationInput | undefined => {
  switch (data?.field) {
    case MovieOrderBy.ADDED_DATE:
      return {
        addedDate: data.dir
      }
    case MovieOrderBy.RELEASE_DATE:
      return {
        movieMetadata: {
          releaseDate: data.dir
        }
      }
    default:
      return undefined;
  }
}

export const getMoviePathById = (repository: RepositoryManager, id: number) => {
  return repository.movie.findById(id, {
    include: {
      library: {
        select: {
          path: true
        }
      }
    }
  }).then(movie =>
    movie ? path.join(movie.library.path, movie.directory, movie.file) : undefined);
}

export const listMoviesWithMetadata = (
  repository: RepositoryManager,
  orderBy?: MovieOrderByOptions,
  limit?: number,
  offset?: number
) => {
  return repository.movie.list(
    {
      include: movieWithMetadataQuery,
      orderBy: createOrderBy(orderBy)
    },
    limit,
    offset
  );
}

export const listPopularMoviesWithMetadata = (repository: RepositoryManager, limit: number, offset?: number) => {
  return repository.movie.list(
    {
      include: movieWithMetadataQuery,
      where: popularMovieSelection
    },
    limit,
    offset
  );
}

export const listMoviesByGenreWithMetadata = (
  repository: RepositoryManager,
  genre: string,
  orderBy?: MovieOrderByOptions,
  limit?: number,
  offset?: number
) => {
  return repository.movie.list(
    {
      include: movieWithMetadataQuery,
      where: movieByGenreSelection(genre),
      orderBy: createOrderBy(orderBy)
    },
    limit,
    offset
  )
}

export const findMovieByIdWithMetadata = (repository: RepositoryManager, id: number) => {
  return repository.movie.findById(id, {
    include: movieWithMetadataQuery
  });
}

export const findMovieByIdWithPath = (repository: RepositoryManager, id: number) => {
  return repository.movie.findById(id, {
    include: {
      library: {
        select: {
          path: true
        }
      }
    }
  })
}

export const listMoviesByTitleWithMetadata = (repository: RepositoryManager, title: string) => {
  return repository.movie.findByTitle(title, {
    include: movieWithMetadataQuery
  });
}

export const getMovieRecommendations = async (repository: RepositoryManager, id: number) => {
  const recommendedIds = await repository.movie.getRecommendedIds(id);
  return repository.movie.list({
    include: movieWithMetadataQuery,
    where: {
      id: {
        in: recommendedIds
      }
    }
  });
}

export const getMovieImages = (repository: RepositoryManager, id: number) => {
  return repository.movie.findById(id, {
    include: {
      movieMetadata: {
        include: {
          images: true
        }
      }
    }
  }).then(movie => movie?.movieMetadata?.images || []);
}

export const getLibraryPathByMovieId = (repository: RepositoryManager, id: number) => {
  return repository.movie.findById(id, {
    include: {
      library: {
        select: {
          path: true
        }
      }
    }
  }).then(movie => movie?.library.path || undefined);
}

export const normalizeMovie = (movie: Awaited<ReturnType<typeof findMovieByIdWithMetadata>>) => {
  if (movie === null) {
    throw new Error('Movie was null');
  }
  return normalizeMovies([movie])[0];
}
export const normalizeMovies = (movies: Awaited<ReturnType<typeof listMoviesWithMetadata>>): MovieResponse[] => {
  return movies.map(movie => ({
    id: movie.id,
    title: movie.movieMetadata?.title || movie.name,
    overview: movie.movieMetadata?.overview,
    releaseDate: cleanDate(movie.movieMetadata?.releaseDate),
    addedDate: cleanDate(movie.addedDate),
    genres: movie.movieMetadata?.genres.map(({ name }) => name) || [],
    posterId: movie.movieMetadata?.images.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: movie.movieMetadata?.images.find(image => image.type == ImageType.BACKDROP)?.id,
    logoId: movie.movieMetadata?.images.find(image => image.type === ImageType.LOGO)?.id,
    trailer: movie.trailerPath !== null,
    duration: movie.duration || undefined
  }))
}