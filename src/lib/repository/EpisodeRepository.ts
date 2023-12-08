import { Image, Prisma } from "@prisma/client";
import { EpisodeMetadata } from "../api/MetadataClient";
import { Repository } from "./Repository";

interface EpisodeOptions<
  T extends Prisma.EpisodeInclude,
  U extends Prisma.EpisodeWhereInput,
  V extends Prisma.EpisodeOrderByWithRelationInput
> {
  include?: Prisma.Subset<T, Prisma.EpisodeInclude>;
  where?: Prisma.Subset<U, Prisma.EpisodeWhereInput>;
  orderBy?: Prisma.Subset<V, Prisma.EpisodeOrderByWithRelationInput>;
}

function makeEpisodeInclude<T extends Prisma.EpisodeInclude>(
  include: Prisma.Subset<T, Prisma.EpisodeInclude>
): T {
  return include
}

export class EpisodeRepository extends Repository {
  public list<
    T extends Prisma.EpisodeInclude,
    U extends Prisma.EpisodeWhereInput,
    V extends Prisma.EpisodeOrderByWithRelationInput
  >(
    options?: EpisodeOptions<T, U, V>,
    limit?: number,
    offset?: number
  ) {
    return this.prisma.episode.findMany({
      orderBy: options?.orderBy,
      take: limit,
      skip: offset || 0,
      include: makeEpisodeInclude(options?.include || {} as Prisma.Subset<T, Prisma.EpisodeInclude>),
      where: options?.where
    });
  }

  public findById<
    T extends Prisma.EpisodeInclude,
    U extends Prisma.EpisodeWhereInput,
    V extends Prisma.EpisodeOrderByWithRelationInput
  >(
    id: number,
    options?: Pick<EpisodeOptions<T, U, V>, 'include'>
  ) {
    return this.prisma.episode.findFirst({
      where: {
        id
      },
      include: makeEpisodeInclude(options?.include || {} as Prisma.Subset<T, Prisma.EpisodeInclude>)
    })
  }

  public findByEpisodeInSeason<
    T extends Prisma.EpisodeInclude,
    U extends Prisma.EpisodeWhereInput,
    V extends Prisma.EpisodeOrderByWithRelationInput
  >(
    episode: number,
    season: number,
    showId: number,
    options?: Pick<EpisodeOptions<T, U, V>, 'include'>
  ) {
    return this.prisma.episode.findFirst({
      where: {
        showId,
        seasonNumber: season,
        episodeNumber: episode,
      },
      include: makeEpisodeInclude(options?.include || {} as Prisma.Subset<T, Prisma.EpisodeInclude>)
    });
  }

  public deleteByPath(path: string) {
    return this.prisma.episode.deleteMany({
      where: {
        path
      }
    });
  }

  public findByPath<T extends Prisma.EpisodeInclude>(path: string, include: Prisma.Subset<T, Prisma.EpisodeInclude>) {
    return this.prisma.episode.findFirst({
      where: {
        path
      },
      include
    });
  }

  public addSubtitle(episodeId: number, language: string, path: string) {
    return this.prisma.subtitle.create({
      data: {
        episodeId,
        language,
        path
      }
    });
  }

  public getSubtitles(episodeId: number) {
    return this.prisma.subtitle.findMany({
      where: {
        episodeId
      },
      select: {
        path: true,
        language: true,
        id: true
      }
    });
  }

  public createWithoutMetadata(
    showId: number,
    seasonNumber: number,
    episodeNumber: number,
    path: string,
    duration?: number
  ) {
    return this.prisma.episode.create({
      data: {
        episodeNumber,
        path,
        addedDate: new Date(),
        duration,
        season: {
          connect: {
            showId_seasonNumber: {
              showId,
              seasonNumber
            }
          }
        }
      }
    })
  }

  public createWithMetadata(
    showId: number,
    seasonNumber: number,
    episodeNumber: number,
    path: string,
    metadata: EpisodeMetadata,
    images: Pick<Image, 'type' | 'preferred' | 'path'>[],
    duration?: number
  ) {
    return this.prisma.episode.create({
      data: {
        season: {
          connect: {
            showId_seasonNumber: {
              seasonNumber,
              showId
            }
          }
        },
        episodeNumber,
        path,
        addedDate: new Date(),
        duration,
        metadata: {
          create: {
            airDate: metadata.airDate,
            name: metadata.name,
            overview: metadata.overview,
            voteAverage: metadata.voteAverage,
            images: {
              create: images.map(image => ({
                ...image
              }))
            },
          }
        }
      }
    })
  }
}