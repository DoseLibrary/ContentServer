import { cleanDate } from "../../util/date";
import { Movie } from "../../models/Movie";
import { ImageType } from "../../models/Image";
import { BasicMovieResponse } from "../../types/movie/BasicMovieResponse";
import { DetailedMovieResponse } from "../../types/movie/DetailedMovieResponse";

export enum MovieOrderBy {
  ADDED_DATE = 'addedDate',
  RELEASE_DATE = 'releaseDate'
}

export interface MovieOrderByOptions {
  field: MovieOrderBy;
  dir: 'asc' | 'desc'
}

export const normalizeDetailedMovie = (movie: Movie): DetailedMovieResponse => {
  return {
    id: movie.id,
    title: movie.metadata?.title || movie.name,
    overview: movie.metadata?.overview,
    releaseDate: cleanDate(movie.metadata?.releaseDate),
    addedDate: cleanDate(movie.addedDate),
    genres: movie.metadata?.genres.map(({ name }) => name) || [],
    posterId: movie.metadata?.images.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: movie.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: movie.metadata?.images.find(image => image.type === ImageType.LOGO)?.id,
    trailer: movie.trailerPath !== null,
    duration: movie.duration || 0,
    characters: movie.metadata?.characters.map(character => ({
      name: character.name,
      orderInCredit: character.orderInCredit,
      actor: {
        name: character.actor.name,
        imageId: character.actor.images[0]?.id, // Frontend only supports one image right now
        id: character.actor.id
      }
    })) || [],
  }
};

export const normalizeDetailedMovies = (movies: Movie[]): DetailedMovieResponse[] => {
  return movies.map(normalizeDetailedMovie);
}

export const normalizeBasicMovie = (movie: Movie): BasicMovieResponse => {
  return {
    id: movie.id,
    title: movie.metadata?.title || movie.name,
    addedDate: cleanDate(movie.addedDate),
    posterId: movie.metadata?.images.find(image => image.type === ImageType.POSTER)?.id,
    backdropId: movie.metadata?.images.find(image => image.type === ImageType.BACKDROP)?.id,
    logoId: movie.metadata?.images.find(image => image.type === ImageType.LOGO)?.id,
  };
};

export const normalizeBasicMovies = (movies: Movie[]): BasicMovieResponse[] => {
  return movies.map(normalizeBasicMovie);
};