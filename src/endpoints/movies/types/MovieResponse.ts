export interface MovieResponse {
  id: number;
  title: string;
  overview?: string;
  releaseDate?: string;
  addedDate: string;
  trailer: boolean;
  genres?: string[];
  posterId?: number;
  backdropId?: number;
  logoId?: number;
  duration?: number; // Is this really optional?
}