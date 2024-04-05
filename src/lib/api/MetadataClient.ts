// TODO: Remove everything related to prisma
import { SeasonMetadata as SeasonMetadataModel, ShowMetadata as ShowMetadataModel, EpisodeMetadata as EpisodeMetadataModel } from "@prisma/client";

export type MovieMetadata = {
  title: string;
  overview: string;
  releaseDate: Date;
  externalId: number;
  genres: string[];
}

export type ShowMetadata  = {
  title: string;
  overview: string;
  firstAirDate: Date;
  externalId: number;
  popularity: number;
  genres: string[];
}

export type SeasonMetadata = {
  name: string;
  airDate: Date;
  overview: string;
  seasonNumber: number;
}

export type EpisodeMetadata = {
  episodeNumber: number;
  airDate: Date;
  name: string;
  overview: string;
  voteAverage: number;
}

export type Cast = {
  id: number;
  name: string;
  image?: string;
  character: string;
  orderInCredit: number;
}

export type MinifiedMovieMetadata = {
  title: string;
  overview: string;
  releaseDate: Date;
  externalId: number;
  poster?: string;
}

export interface MetadataClient {
  getMovieMetadata(name: string): Promise<MovieMetadata | undefined>;
  getMovieMetadataByExternalId(id: number): Promise<MovieMetadata | undefined>;
  getMovieMetadataByYear(name: string, year: number): Promise<MovieMetadata | undefined>;
  searchMovieMetadata(name: string): Promise<MinifiedMovieMetadata[]>;
  getRecommendedMovies(id: number): Promise<number[]>;
  getPopularMovieIds(): Promise<number[]>;
  getActorsInMovie(id: number): Promise<Cast[]>

  getShowMetadata(name: string): Promise<ShowMetadata | undefined>;
  getSeasonMetadata(showId: number, seasonNumber: number): Promise<SeasonMetadata | undefined>;
  getEpisodeMetadata(showId: number, seasonNumber: number, episode: number): Promise<EpisodeMetadata | undefined>;
}
