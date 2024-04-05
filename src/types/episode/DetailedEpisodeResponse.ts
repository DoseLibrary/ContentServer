export interface DetailedEpisodeResponse {
  showId: number;
  season: number,
  episode: number,
  addedDate: string,
  duration?: number,
  title?: string;
  airDate?: string,
  overview?: string;
  posterId?: number;
  backdropId?: number;
  logoId?: number;
}