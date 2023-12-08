import { Cast, EpisodeMetadata, MetadataClient, MinifiedMovieMetadata, MovieMetadata, SeasonMetadata, ShowMetadata } from "../MetadataClient";
import { TmdbClient } from "./TmdbClient";
import { ActorFetchResult, EpisodeFetchResult, FetchResult, MinifiedData, SearchResult, SeasonFetchResult, ShowFetchResult } from "./types/TmdbTypes";


export class TmdbMetadataClient extends TmdbClient implements MetadataClient {
  async getShowMetadata(name: string): Promise<ShowMetadata | undefined> {
    const showId = await this.fetchShowId(name);
    if (showId === undefined) {
      return undefined;
    }

    const metadata = await this.fetchShowMetadata(showId);
    if (metadata === undefined) {
      return undefined;
    }

    return {
      title: metadata.original_name,
      overview: metadata.overview,
      firstAirDate: new Date(metadata.first_air_date),
      popularity: metadata.popularity,
      externalId: metadata.id,
      genres: metadata.genres.map(genre => genre.name)
    }
  }

  async getEpisodeMetadata(showId: number, seasonNumber: number, episodeNumber: number): Promise<EpisodeMetadata | undefined> {
    const metadata = await this.fetchEpisodeMetadata(showId, seasonNumber, episodeNumber);
    if (metadata === undefined) {
      return undefined;
    }
    return {
      episodeNumber,
      name: metadata.name,
      overview: metadata.overview,
      voteAverage: metadata.vote_average,
      airDate: new Date(metadata.air_date),
    }
  }

  async getSeasonMetadata(showId: number, seasonNumber: number): Promise<SeasonMetadata | undefined> {
    const metadata = await this.fetchSeasonMetadata(showId, seasonNumber);
    if (metadata === undefined) {
      return undefined;
    }
    return {
      name: metadata.name,
      airDate: new Date(metadata.air_date),
      seasonNumber: metadata.season_number,
      overview: metadata.overview
    }
  }

  async getActorsInMovie(id: number): Promise<Cast[]> {
    const result = await this.request<ActorFetchResult>(`/movie/${id}/credits`, {
      language: 'en-UD',
      include_image_language: 'en,null'
    }).then(response => response.cast)
      .catch(() => []);

    return result
      .filter(actor => actor.known_for_department === 'Acting')
      .map(actor => ({
        name: actor.name,
        image: actor.profile_path || undefined,
        character: actor.character,
        orderInCredit: actor.order,
        id: actor.id
      }))
  }

  async getPopularMovieIds(): Promise<number[]> {
    const request = (page: number) => {
      return this.request<SearchResult>('/movie/popular', {
        language: 'en-US',
        page
      });
    };
    const popularMovies = (await Promise.all([
      request(1),
      request(2),
      request(3),
    ])).reduce((acc, curr) => acc.concat(curr.results), [] as MinifiedData[]);
    return popularMovies.map(movie => movie.id);
  }

  async getMovieMetadataByExternalId(id: number): Promise<MovieMetadata | undefined> {
    const metadata = await this.fetchMovieMetadata(id);
    if (metadata === undefined) {
      return undefined;
    }

    return {
      title: metadata.title,
      overview: metadata.overview,
      releaseDate: new Date(metadata.release_date),
      externalId: metadata.id,
      genres: metadata.genres.map(genre => genre.name)
    };
  }

  async getMovieMetadata(name: string): Promise<MovieMetadata | undefined> {
    const movieId = await this.fetchMovieId(name);
    if (movieId === undefined) {
      return undefined;
    }
    const metadata = await this.fetchMovieMetadata(movieId);
    if (metadata === undefined) {
      return undefined;
    }

    return {
      title: metadata.title,
      overview: metadata.overview,
      releaseDate: new Date(metadata.release_date),
      externalId: metadata.id,
      genres: metadata.genres.map(genre => genre.name)
    };
  }

  async getMovieMetadataByYear(name: string, year: number): Promise<MovieMetadata | undefined> {
    const movieId = await this.fetchMovieId(name, year);
    if (movieId === undefined) {
      return undefined;
    }
    const metadata = await this.fetchMovieMetadata(movieId);
    if (metadata === undefined) {
      return undefined;
    }

    return {
      title: metadata.title,
      overview: metadata.overview,
      releaseDate: new Date(metadata.release_date),
      externalId: metadata.id,
      genres: metadata.genres.map(genre => genre.name)
    };
  }

  async getRecommendedMovies(id: number): Promise<number[]> {
    return this.fetchRecommendedMovies(id)
      .then(movies => movies.map(movie => movie.id));
  }

  async searchMovieMetadata(name: string): Promise<MinifiedMovieMetadata[]> {
    const IMAGE_URL = 'https://image.tmdb.org/t/p'
    return this.request<SearchResult>('/search/movie', {
      language: 'en-US',
      query: name,
      page: 1,
      include_adult: true
    }).then(data => data.results.map(result => ({
      title: result.title,
      overview: result.overview,
      releaseDate: new Date(result.release_date),
      externalId: result.id,
      poster: result.poster_path ? `${IMAGE_URL}/w500${result.poster_path}` : undefined
    })));
  }

  private fetchRecommendedMovies(id: number, page: number = 1): Promise<MinifiedData[]> {
    return this.request<SearchResult>(`/movie/${id}/recommendations`, {
      language: 'en-US',
      include_image_language: 'en,null',
      page
    })
      .then(async (data) => {
        const result = data.results;
        if (page < data.total_pages) {
          const nextPage = await this.fetchRecommendedMovies(id, page + 1);
          result.push(...nextPage);
        }
        return result;
      })
  }

  private fetchMovieMetadata(id: number) {
    return this.request<FetchResult>(`/movie/${id}`, {
      language: 'en-US'
    }).catch(() => {
      // TODO: Check status code? 34 is not found
      return undefined;
    })
  }

  private fetchMovieId(name: string, year?: number): Promise<number | undefined> {
    return this.request<SearchResult>('/search/movie', {
      language: 'en-US',
      query: name,
      year,
      page: 1,
      include_adult: true
    }).then(data => {
      if (data.total_results === 0) {
        return undefined;
      }
      return data.results[0].id;
    }).catch(() => {
      return undefined;
    })
  }

  private fetchSeasonMetadata(showId: number, seasonNumber: number) {
    return this.request<SeasonFetchResult>(`/tv/${showId}/season/${seasonNumber}`, {
      language: 'en-US'
    }).catch(() => {
      // TODO: Check status code? 34 is not found
      return undefined;
    })
  }

  private fetchEpisodeMetadata(showId: number, seasonNumber: number, episodeNumber: number) {
    return this.request<EpisodeFetchResult>(`/tv/${showId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      language: 'en-US'
    }).catch(() => {
      // TODO: Check status code? 34 is not found
      return undefined;
    })
  }

  private fetchShowMetadata(id: number) {
    return this.request<ShowFetchResult>(`/tv/${id}`, {
      language: 'en-US'
    }).catch(() => {
      // TODO: Check status code? 34 is not found
      return undefined;
    })
  }

  private fetchShowId(name: string): Promise<number | undefined> {
    return this.request<SearchResult>('/search/tv', {
      language: 'en-US',
      query: name,
      page: 1,
      include_adult: true
    }).then(data => {
      if (data.total_results === 0) {
        return undefined;
      }
      return data.results[0].id;
    }).catch(() => {
      return undefined;
    })
  }
}