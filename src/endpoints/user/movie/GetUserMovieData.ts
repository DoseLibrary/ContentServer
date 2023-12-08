import { EventEmitter } from "events";
import { ValidationChain, param } from "express-validator";
import { GetEndpoint } from "../../../lib/Endpoint";
import { RequestData } from "../../../types/RequestData";
import { RepositoryManager } from "../../../lib/repository";
import { getUserWatchlist, getWatchedMovies, listOngoingMovies } from "../../../lib/queries/userQueries";

interface Param {
  id: number;
}

export class GetUserMovieData extends GetEndpoint {
  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/movie/:id', emitter, repository);
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('id').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<unknown, unknown, Param>): Promise<unknown> {
    const ongoingMovies = await listOngoingMovies(this.repository, data.userId);
    const watchlist = await getUserWatchlist(this.repository, data.userId);
    const watchedMovie = await getWatchedMovies(this.repository, data.userId);

    const ongoingMovie = ongoingMovies.find(movie => movie.id === data.params.id);
    return {
      lastWatched: ongoingMovie?.lastWatched,
      timeWatched: ongoingMovie?.timeWatched,
      inWatchlist: watchlist.some(movie => movie.id === data.params.id),
      watched: watchedMovie.some(movie => movie.id === data.params.id)
    }
  }

}