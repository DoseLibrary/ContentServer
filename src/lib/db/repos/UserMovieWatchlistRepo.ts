import { Repo } from "./Repo";

export class UserMovieWatchlistRepo extends Repo {
  add(userId: number, movieId: number) {
    return this.db.none('INSERT INTO user_movie_watchlist (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO nothing', [userId, movieId])
  }

  remove(userId: number, movieId: number) {
    this.db.none('DELETE FROM user_movie_watchlist WHERE user_id = $1 AND movie_id = $2', [userId, movieId]);
  }
}