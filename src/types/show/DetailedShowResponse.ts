export interface DetailedShowResponse {
  id: number;
  title: string;
  overview?: string;
  firstAirDate?: string;
  addedDate: string;
  genres: string[];
  posterId?: number;
  backdropId?: number;
  logoId?: number;
  seasons: {
    title?: String;
    number: number;
    posterId?: number;
  }[];
}