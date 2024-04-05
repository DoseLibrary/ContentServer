export interface BasicMovieResponse {
  id: number;
  addedDate: string;
  title: string;
  overview?: string;
  posterId?: number;
  backdropId?: number;
  logoId?: number;
}

export interface BasicMovieWithUserProgressResponse extends BasicMovieResponse {
  progress: number;
  lastWatched?: string;
}
