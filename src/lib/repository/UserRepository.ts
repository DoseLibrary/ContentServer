import { Prisma } from "@prisma/client";
import { Repository } from "./Repository";

export class UserRepository extends Repository {
  findByUsername(username: string) {
    return this.prisma.user.findFirst({
      where: {
        username
      }
    });
  }

  public listOngoingEpisodes<T extends Prisma.EpisodeInclude>(include: Prisma.Subset<T, Prisma.EpisodeInclude>, id: number, limit?: number, offset: number = 0) {
    return this.prisma.ongoingEpisode.findMany({
      where: {
        userId: id
      },
      select: {
        episode: {
          include
        },
        lastWatched: true,
        time: true
      },
      take: limit,
      skip: offset
    }).then(ongoing => ongoing.map(episode => ({ ...episode.episode, lastWatched: episode.lastWatched, timeWatched: episode.time })));
  }

  public listOngoingMovies<T extends Prisma.MovieInclude>(include: Prisma.Subset<T, Prisma.MovieInclude>, id: number, limit?: number, offset: number = 0) {
    return this.prisma.ongoingMovie.findMany({
      where: {
        userId: id
      },
      select: {
        movie: {
          include
        },
        lastWatched: true,
        time: true
      },
      take: limit,
      skip: offset
    }).then(movies => movies.map(movie => ({ ...movie.movie, lastWatched: movie.lastWatched, timeWatched: movie.time })));
  }

  public listWatchlist<T extends Prisma.MovieInclude>(include: Prisma.Subset<T, Prisma.MovieInclude>, id: number, limit?: number, offset: number = 0) {
    return this.prisma.user.findFirst({
      where: {
        id
      },
      select: {
        movieWatchlist: {
          include
        }
      }
    }).then(user => user?.movieWatchlist || []);
  }

  public listWatchedMovies<T extends Prisma.MovieInclude>(include: Prisma.Subset<T, Prisma.MovieInclude>, id: number, limit?: number, offset: number = 0) {
    return this.prisma.user.findFirst({
      where: {
        id
      },
      select: {
        watchedMovies: {
          include
        }
      }
    }).then(user => user?.watchedMovies || []);
  }

  public markMovieAsWatched(userId: number, movieId: number) {
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        watchedMovies: {
          connect: {
            id: movieId
          }
        },
        ongoingMovies: {
          deleteMany: {
            AND: {
              userId,
              movieId
            }
          }
        }
      }
    })
  }

  public unmarkMovieAsWatched(userId: number, movieId: number) {
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        watchedMovies: {
          disconnect: {
            id: movieId,
          }
        }
      }
    })
  }

  public addToWatchlist(userId: number, movieId: number) {
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        movieWatchlist: {
          connect: {
            id: movieId
          },
        }
      }
    })
  }

  public removeFromWatchlist(userId: number, movieId: number) {
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        movieWatchlist: {
          disconnect: {
            id: movieId
          }
        }
      }
    })
  }

  public updateOngoingEpisode(userId: number, showId: number, seasonNumber: number, episodeNumber: number, time: number) {
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        ongoingEpisodes: {
          deleteMany: {
            NOT: {
              AND: {
                userId,
                showId,
                seasonNumber,
                episodeNumber
              }
            }
          },
          upsert: {
            create: {
              episodeNumber,
              seasonNumber,
              showId,
              lastWatched: new Date(),
              time
            },
            update: {
              lastWatched: new Date(),
              time
            },
            where: {
              userId_showId_seasonNumber_episodeNumber: {
                userId,
                episodeNumber,
                seasonNumber,
                showId
              }
            }
          }
        }
      }
    })
  }

  public updateOngoingMovie(userId: number, movieId: number, time: number) {
    return this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        ongoingMovies: {
          upsert: {
            create: {
              movieId,
              lastWatched: new Date(),
              time,
            },
            update: {
              lastWatched: new Date(),
              time
            },
            where: {
              userId_movieId: {
                movieId,
                userId
              }
            }
          }
        }
      }
    })
  }

}