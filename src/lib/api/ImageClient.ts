export type Image = {
  language?: string;
  aspectRatio: number;
  url: string;
}

export type ImageCollection = {
  backdrops: Image[];
  posters: Image[];
  logos: Image[];
}

export interface ImageClient {
  downloadImage(path: string, quality?: string): Promise<Buffer>;

  getMovieImages(id: number): Promise<ImageCollection>;
  getShowImages(id: number): Promise<ImageCollection>;
  getSeasonImages(id: number, seasonNumber: number): Promise<ImageCollection>;
  getEpisodeImages(id: number, seasonNumber: number, episodeNumber: number): Promise<ImageCollection>;
}
