import { Image, ImageSource, ImageType, Prisma } from "@prisma/client";
import { Cast, MovieMetadata } from "../../api/MetadataClient";
import { Repository } from "../Repository";
import { generateMetadataInsertQuery } from "./queries";
import { PreferredImage } from "../../../types/PreferredImage";

interface MovieOptions<
  T extends Prisma.MovieInclude,
  U extends Prisma.MovieWhereInput,
  V extends Prisma.MovieOrderByWithRelationInput,
> {
  include?: Prisma.Subset<T, Prisma.MovieInclude>;
  where?: Prisma.Subset<U, Prisma.MovieWhereInput>;
  orderBy?: Prisma.Subset<V, Prisma.MovieOrderByWithRelationInput>;
}

function makeMovieInclude<T extends Prisma.MovieInclude>(
  include: Prisma.Subset<T, Prisma.MovieInclude>
): T {
  return include
}

export class MovieRepository extends Repository {
  public raw() {
    return this.prisma.movie;
  }

  public findById<
    T extends Prisma.MovieInclude,
    U extends Prisma.MovieWhereInput,
    V extends Prisma.MovieOrderByWithRelationInput,
  >(
    id: number,
    options?: Pick<MovieOptions<T, U, V>, 'include'>
  ) {
    return this.prisma.movie.findFirst({
      where: {
        id
      },
      include: makeMovieInclude(options?.include || {} as Prisma.Subset<T, Prisma.MovieInclude>)
    })
  }

  public findByTitle<
    T extends Prisma.MovieInclude,
    U extends Prisma.MovieWhereInput,
    V extends Prisma.MovieOrderByWithRelationInput
  >(
    title: string,
    options?: Pick<MovieOptions<T, U, V>, 'include'>
  ) {
    return this.prisma.movie.findMany({
      where: {
        OR: [
          {
            name: {
              contains: title,
              mode: 'insensitive'
            }
          },
          {
            movieMetadata: {
              title: {
                contains: title,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: makeMovieInclude(options?.include || {} as Prisma.Subset<T, Prisma.MovieInclude>)
    });
  }

  public list<
    T extends Prisma.MovieInclude,
    U extends Prisma.MovieWhereInput,
    V extends Prisma.MovieOrderByWithRelationInput,
  >(
    options?: MovieOptions<T, U, V>,
    limit?: number,
    offset?: number,
  ) {
    return this.prisma.movie.findMany({
      orderBy: options?.orderBy,
      skip: offset || 0,
      take: limit,
      include: makeMovieInclude(options?.include || {} as Prisma.Subset<T, Prisma.MovieInclude>),
      where: options?.where
    });
  }

  public async getRecommendedIds(id: number): Promise<number[]> {
    const data = await this.prisma.movieRecommendation.findMany({
      where: {
        OR: [
          {
            movieIdA: id
          },
          {
            movieIdB: id
          }
        ]
      },
      select: {
        movieIdA: true,
        movieIdB: true
      }
    });
    return data.map(({ movieIdA, movieIdB }) => [movieIdA, movieIdB])
      .flat()
      .filter(recommendedId => recommendedId !== id);
  }

  public updateMetadata(
    movieId: number,
    metadata: MovieMetadata,
    cast: Cast[],
    images: Pick<Image, 'type' | 'preferred' | 'path'>[],
    recommendations: number[],
  ) {
    console.log(cast);
    return this.prisma.$transaction([
      this.prisma.movieMetadata.deleteMany({
        where: {
          movieId
        },
      }),
      this.prisma.image.deleteMany({
        where: {
          MovieMetadata: {
            some: {
              movieId
            }
          },
        }
      }),
      this.prisma.movie.update({
        where: {
          id: movieId
        },
        data: {
          movieMetadata: {
            create: generateMetadataInsertQuery(metadata, cast, images, recommendations),
          }
        }
      })
    ]);
  }

  // TODO: Make generic update function instead?
  public resetAllPopular() {
    return this.prisma.movieMetadata.updateMany({
      data: {
        popular: false
      }
    });
  }

  // TODO: Make updateMany version?
  public setPopular(id: number, value: boolean) {
    return this.prisma.movieMetadata.update({
      where: {
        movieId: id
      },
      data: {
        popular: value
      }
    });
  }

  public updateTrailer(id: number, path: string) {
    return this.prisma.movie.update({
      where: {
        id
      },
      data: {
        trailerPath: path
      }
    });
  }

  public findByExternalIds(ids: number[]) {
    return this.prisma.movie.findMany({
      where: {
        movieMetadata: {
          externalId: {
            in: ids
          }
        }
      }
    })
  }

  public deleteById(id: number) {
    return this.prisma.$transaction([
      this.prisma.image.deleteMany({
        where: {
          MovieMetadata: {
            every: {
              movieId: id
            }
          },
        }
      }),
      this.prisma.movie.delete({
        where: {
          id
        }
      })
    ])
  }

  // TODO: Find many on this?
  public findByPathInLibrary(directory: string, file: string, libraryId: number) {
    return this.prisma.movie.findFirst({
      where: {
        directory,
        file,
        libraryId
      }
    });
  }
  // TODO: Find many on this? Filter stuff?
  public findByDirectoryInLibrary(directory: string, libraryId: number) {
    return this.prisma.movie.findFirst({
      where: {
        directory,
        libraryId
      }
    });
  }

  public addSubtitle(movieId: number, language: string, path: string) {
    return this.prisma.subtitle.create({
      data: {
        language,
        path,
        movieId
      }
    });
  }

  public getSubtitles(movieId: number) {
    return this.prisma.subtitle.findMany({
      where: {
        movieId
      },
      select: {
        path: true,
        language: true,
        id: true
      }
    });
  }

  public createWithMetadata(
    libraryId: number,
    directory: string,
    file: string,
    metadata: MovieMetadata,
    cast: Cast[],
    images: PreferredImage[],
    recommendations: number[],
    duration?: number
  ) {
    // TODO: set found good poster, backdrop, logo to true/false
    // TODO: possible race condition if another movie does the connectOrCreate at the same time
    // See: https://www.prisma.io/docs/orm/reference/prisma-client-reference#connectorcreate
    // There they have recommendation on how to handle it
    return this.prisma.movie.create({
      data: {
        name: metadata.title,
        directory,
        file,
        duration,
        libraryId,
        addedDate: new Date(),
        movieMetadata: {
          create: generateMetadataInsertQuery(metadata, cast, images, recommendations)
        }
      }
    })
  }

  public createWithoutMetadata(directory: string, file: string, name: string, libraryId: number, duration?: number) {
    return this.prisma.movie.create({
      data: {
        name,
        directory,
        file,
        libraryId,
        duration,
        addedDate: new Date()
      }
    });
  }
}