import { MovieMetadata as MovieMetadataModel, SeasonMetadata as SeasonMetadataModel, ShowMetadata as ShowMetadataModel, EpisodeMetadata as EpisodeMetadataModel } from "@prisma/client";

export type MovieMetadata = Omit<
  MovieMetadataModel,
  'movieId' | 'popular'
> & { genres: string[] };

export type ShowMetadata = Omit<
  ShowMetadataModel,
  'showId'
> & { genres: string[] };

export type SeasonMetadata = Omit<
  SeasonMetadataModel,
  'showId' | 'id'
>;

export type EpisodeMetadata = Omit<
  EpisodeMetadataModel,
  'showId' | 'seasonNumber' | 'id'
  >;

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
