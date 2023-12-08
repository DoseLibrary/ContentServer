import { CategoryRepo } from "./CategoryRepo";
import { MovieMetadataRepo } from "./MovieMetadataRepo";
import { MovieRepo } from "./MovieRepo";
import { SerieMetadataRepo } from "./SerieMetadataRepo";
import { UserMovieWatchlistRepo } from "./UserMovieWatchlistRepo";
import { UserRepo } from "./UserRepo";

interface IExtensions {
  user: UserRepo;
  category: CategoryRepo;
  movieMetadata: MovieMetadataRepo;
  serieMetadata: SerieMetadataRepo;
  userMovieWatchlist: UserMovieWatchlistRepo;
  movieRepo: MovieRepo;
}

export {
  IExtensions,
  UserRepo,
  CategoryRepo,
  MovieMetadataRepo,
  SerieMetadataRepo,
  UserMovieWatchlistRepo,
  MovieRepo
};
