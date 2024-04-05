export interface DetailedSeasonResponse {
  season: number;
  addedDate: string;
  title?: string;
  overview?: string;
  airDate?: string;
  posterId?: number;
  backdropId?: number;
  episodes: {
    episode: number;
    backdropId?: number;
    title?: string;
    overview?: string;
  }[];
  show: {
    title: string;
    id: number;
  }
}
