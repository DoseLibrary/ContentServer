import { Image, ImageClient, ImageCollection } from "../ImageClient";
import { TmdbClient } from "./TmdbClient";
import { FetchImagesResult } from "./types/TmdbTypes";

const emptyResponse = {
  backdrops: [],
  posters: [],
  logos: []
};

export class TmdbImageClient extends TmdbClient implements ImageClient {
  public static IMAGE_URL = 'https://image.tmdb.org/t/p';

  async downloadImage(path: string, quality: string = 'original'): Promise<Buffer> {
    return fetch(`${TmdbImageClient.IMAGE_URL}/${quality}/${path}`)
      .then(res => res.arrayBuffer())
      .then(arrBuffer => Buffer.from(arrBuffer));
  }

  async getShowImages(id: number): Promise<ImageCollection> {
    const images = await this.fetchShowImages(id);
    return images !== undefined ?
      this.parseResult(images) :
      emptyResponse
  }

  async getSeasonImages(id: number, seasonNumber: number): Promise<ImageCollection> {
    const images = await this.fetchSeasonImages(id, seasonNumber);
    return images !== undefined ?
      this.parseResult(images) :
      emptyResponse
  }

  async getEpisodeImages(id: number, seasonNumber: number, episodeNumber: number): Promise<ImageCollection> {
    const images = await this.fetchEpisodeImages(id, seasonNumber, episodeNumber);
    return images !== undefined ?
      this.parseResult(images) :
      emptyResponse
  }

  async getMovieImages(id: number, includeBaseUrl: boolean = false): Promise<ImageCollection> {
    const images = await this.fetchMovieImages(id);
    return images !== undefined ?
      this.parseResult(images, includeBaseUrl) :
      emptyResponse
  }

  private parseResult(images: FetchImagesResult, includeBaseUrl: boolean = false): ImageCollection {
    const result: ImageCollection = {
      backdrops: [],
      posters: [],
      logos: []
    };
    const getUrl = (url: string) => {
      return includeBaseUrl ?
        `${TmdbImageClient.IMAGE_URL}/${url}`: url;
    }

    const backdrops = (images.stills || []).concat(images.backdrops || []);
    backdrops.forEach((image) => {
      result.backdrops.push({
        language: image.iso_639_1 || undefined,
        aspectRatio: image.aspect_ratio,
        url: getUrl(image.file_path)
      });
    });
    (images.posters || []).forEach((image) => {
      result.posters.push({
        language: image.iso_639_1 || undefined,
        aspectRatio: image.aspect_ratio,
        url: getUrl(image.file_path)
      });
    });
    (images.logos || []).forEach((image) => {
      result.logos.push({
        language: image.iso_639_1 || undefined,
        aspectRatio: image.aspect_ratio,
        url: getUrl(image.file_path)
      });
    });
    return result;
  }


  private fetchMovieImages(id: number): Promise<FetchImagesResult | undefined> {
    return this.request<FetchImagesResult>(`/movie/${id}/images`, {
      language: 'en-US',
      include_image_language: 'en,null'
    }).catch((err) => {
      return undefined;
    })
  }

  private fetchShowImages(id: number): Promise<FetchImagesResult | undefined> {
    return this.request<FetchImagesResult>(`/tv/${id}/images`, {
      language: 'en-US',
      include_image_language: 'en,null'
    }).catch((err) => {
      return undefined;
    })
  }

  private fetchSeasonImages(id: number, seasonNumber: number): Promise<FetchImagesResult | undefined> {
    return this.request<FetchImagesResult>(`/tv/${id}/season/${seasonNumber}/images`, {
      language: 'en-US',
      include_image_language: 'en,null'
    }).catch((err) => {
      return undefined;
    })
  }

  private fetchEpisodeImages(id: number, seasonNumber: number, episodeNumber: number): Promise<FetchImagesResult | undefined> {
    return this.request<FetchImagesResult>(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}/images`, {
      language: 'en-US',
      include_image_language: 'en,null'
    }).catch((err) => {
      return undefined;
    })
  }
}