import { ShowResponse } from "./ShowResponse";

export interface EpisodeResponse {
  id: number;
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
  // show: Omit<ShowResponse, 'seasons'>;
}