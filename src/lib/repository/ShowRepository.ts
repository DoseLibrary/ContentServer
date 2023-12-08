import { Image, Prisma } from "@prisma/client";
import { ShowMetadata } from "../api/MetadataClient";
import { Repository } from "./Repository";

interface ShowOptions<
  T extends Prisma.ShowInclude,
  U extends Prisma.ShowWhereInput,
  V extends Prisma.ShowOrderByWithRelationInput
> {
  include?: Prisma.Subset<T, Prisma.ShowInclude>;
  where?: Prisma.Subset<U, Prisma.ShowWhereInput>;
  orderBy?: Prisma.Subset<V, Prisma.ShowOrderByWithRelationInput>;
}

function makeShowInclude<T extends Prisma.ShowInclude>(
  include: Prisma.Subset<T, Prisma.ShowInclude>
): T {
  return include
}

export class ShowRepository extends Repository {
  public list<
    T extends Prisma.ShowInclude,
    U extends Prisma.ShowWhereInput,
    V extends Prisma.ShowOrderByWithRelationInput
  >(
    options?: ShowOptions<T, U, V>,
    limit?: number,
    offset?: number
  ) {
    return this.prisma.show.findMany({
      orderBy: options?.orderBy,
      skip: offset || 0,
      take: limit,
      include: makeShowInclude(options?.include || {} as Prisma.Subset<T, Prisma.ShowInclude>),
      where: options?.where
    });
  }

  public findByTitle<
    T extends Prisma.ShowInclude,
    U extends Prisma.ShowWhereInput,
    V extends Prisma.ShowOrderByWithRelationInput
  >(
    title: string,
    options?: Pick<ShowOptions<T, U, V>, 'include'>
  ) {
    return this.prisma.show.findMany({
      where: {
        OR: [
          {
            name: {
              contains: title,
              mode: 'insensitive'
            }
          },
          {
            showMetadata: {
              title: {
                contains: title,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: makeShowInclude(options?.include || {} as Prisma.Subset<T, Prisma.ShowInclude>)
    });
  }

  public findById<
    T extends Prisma.ShowInclude,
    U extends Prisma.ShowWhereInput,
    V extends Prisma.ShowOrderByWithRelationInput
  >(
    id: number,
    options?: Omit<ShowOptions<T, U, V>, 'where'>
  ) {
    return this.prisma.show.findFirst({
      where: {
        id
      },
      include: makeShowInclude(options?.include || {} as Prisma.Subset<T, Prisma.ShowInclude>),
      orderBy: options?.orderBy
    });
  }

  public deleteById(id: number) {
    return this.prisma.show.delete({
      where: {
        id
      }
    });
  }

  public findByPathInLibrary(path: string, libraryId: number) {
    return this.prisma.show.findFirst({
      where: {
        path,
        libraryId
      }
    });
  }

  public createWithoutMetadata(path: string, libraryId: number, name: string) {
    return this.prisma.show.create({
      data: {
        path,
        libraryId,
        name,
        addedDate: new Date()
      }
    });
  }

  public createWithMetadata(
    libraryId: number,
    path: string,
    metadata: ShowMetadata,
    images: Pick<Image, 'type' | 'preferred' | 'path'>[]
  ) {
    return this.prisma.show.create({
      data: {
        name: metadata.title,
        path,
        libraryId,
        addedDate: new Date(),
        showMetadata: {
          create: {
            title: metadata.title,
            overview: metadata.overview,
            firstAirDate: metadata.firstAirDate,
            popularity: metadata.popularity,
            externalId: metadata.externalId,
            images: {
              create: images.map(image => ({
                ...image
              }))
            },
            genres: {
              connectOrCreate: metadata.genres.map(genre => ({
                where: { name: genre },
                create: { name: genre }
              }))
            }
          }
        }
      }
    })
  }
}