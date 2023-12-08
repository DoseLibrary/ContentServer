import { Image, Prisma } from "@prisma/client";
import { SeasonMetadata } from "../api/MetadataClient";
import { Repository } from "./Repository";

export class SeasonRepository extends Repository {
  public findBySeasonInShow<T extends Prisma.SeasonInclude>(season: number, showId: number, include: Prisma.Subset<T, Prisma.SeasonInclude>) {
    return this.prisma.season.findFirst({
      where: {
        seasonNumber: season,
        showId
      },
      include
    });
  }

  public deleteBySeasonInShow(season: number, showId: number) {
    return this.prisma.season.delete({
      where: {
        showId_seasonNumber: {
          showId,
          seasonNumber: season
        }
      }
    })
  }

  public createWithoutMetadata(showId: number, seasonNumber: number, path: string) {
    return this.prisma.season.create({
      data: {
        show: {
          connect: {
            id: showId
          }
        },
        seasonNumber,
        path,
        addedDate: new Date()
      }
    });
  }

  public createWithMetadata(
    showId: number,
    seasonNumber: number,
    path: string,
    metadata: SeasonMetadata,
    images: Pick<Image, 'type' | 'preferred' | 'path'>[]
  ) {
    return this.prisma.season.create({
      data: {
        show: {
          connect: {
            id: showId
          }
        },
        seasonNumber,
        path,
        addedDate: new Date(),
        seasonMetadata: {
          create: {
            name: metadata.name,
            airDate: metadata.airDate,
            overview: metadata.overview,
            images: {
              create: images.map(image => ({
                ...image
              }))
            },
          }
        }
      }
    });
  }
}