import { Image, ImageSource, ImageType, Prisma } from "@prisma/client"
import { Cast, MovieMetadata } from "../../api/MetadataClient";
import { PreferredImage } from "../../../types/PreferredImage";

export const generateMetadataInsertQuery = (
  metadata: MovieMetadata,
  cast: Cast[],
  images: PreferredImage[],
  recommendations: number[]
) => ({
  title: metadata.title,
  overview: metadata.overview,
  releaseDate: metadata.releaseDate,
  externalId: metadata.externalId,
  recommendations: {
    createMany: {
      data: recommendations.map((recommendation, idx) => ({
        movieIdB: recommendation, // movieIdB is the recommended movie, should be renamed
        priority: idx
      }))
    }
  },
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
  },
  characters: {
    create: cast.map(actor => ({
      name: actor.character,
      orderInCredit: actor.orderInCredit,
      actor: {
        connectOrCreate: {
          create: {
            name: actor.name,
            id: actor.id,
            image: actor.image == undefined ? {} : {
              create: {
                path: actor.image,
                preferred: true,
                type: ImageType.POSTER,
                source: ImageSource.TMDB // TODO: Should NOT be hardcoded. Needs to be changed when we support more image client
              }
            },
          },
          where: {
            id: actor.id
          }
        },
      }
    }))
  }
});