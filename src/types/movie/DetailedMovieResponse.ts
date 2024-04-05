interface Character {
  name: string;
  orderInCredit: number;
  actor: {
    id: number;
    name: string;
    imageId?: number;
  }

}

export interface DetailedMovieResponse {
  id: number;
  title: string;
  addedDate: string;
  genres: string[];
  characters: Character[];
  overview?: string;
  releaseDate?: string;
  trailer: boolean;
  posterId?: number;
  backdropId?: number;
  logoId?: number;
  duration?: number; // Is this really optional?
}
