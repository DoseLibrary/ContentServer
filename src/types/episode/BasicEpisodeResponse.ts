export interface BasicEpisodeResponse {
  showId: number;
  season: number,
  episode: number,
  addedDate: string,
  title?: string;
  posterId?: number;
  backdropId?: number;
  logoId?: number;
}

export interface BasicEpisodeWithUserProgressResponse extends BasicEpisodeResponse {
  progress: number;
  lastWatched?: string;
}
