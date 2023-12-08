interface Genre {
  id: number;
  name: string;
}

interface ProductionCompany {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface Cast {
  adult: boolean;
  gender: boolean;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null; // image
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface MinifiedData {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface SearchResult {
  page: number;
  total_pages: number;
  results: MinifiedData[];
  total_results: number;
}

export interface FetchResult {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: unknown; // Not sure what this is
  budget: number;
  genres: Genre[];
  homepage: string;
  id: number;
  imdb_id: string;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string; // Some sort of enum "Released", etc..
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface ShowFetchResult {
  adult: boolean;
  backdrop_path: string;
  first_air_date: string;
  genres: Genre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string; // undefined / null?
  name: string;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
}

export interface SeasonFetchResult {
  air_date: string;
  name: string;
  overview: string;
  id: number;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

export interface EpisodeFetchResult {
  air_date: string;
  name: string;
  overview: string;
  id: number;
  production_code: string;
  runtime: number;
  season_number: number;
  still_path: string;
  vote_average: number;
  vote_count: number;
}

export interface ActorFetchResult {
  id: number;
  cast: Cast[];
}

export interface Error {
  success: false;
  status_code: number;
  status_message: string;
}


interface Image {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null // Language
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
  id: number;
};

export interface FetchImagesResult {
  backdrops?: Image[];
  posters?: Image[];
  logos?: Image[];
  stills?: Image[];
}