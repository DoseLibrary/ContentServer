import { EventEmitter } from "events";
import { ValidationChain, body, param, query } from "express-validator";
import { PostEndpoint } from "../../lib/Endpoint";
import { RequestData } from "../../types/RequestData";
import { RepositoryManager } from "../../lib/repository";
import { TmdbMetadataClient } from "../../lib/api/tmdb/TmdbMetadataClient";
import { MetadataClient, MinifiedMovieMetadata } from "../../lib/api/MetadataClient";
import { NotFoundException } from "../../exceptions/NotFoundException";
import { findMovieByIdWithMetadata, findMovieByIdWithPath, getMovieImages, normalizeMovie } from "../../lib/queries/movieQueries";
import { ImageSource, ImageType } from "@prisma/client";
import { downloadPreferredImage } from "../../lib/api/util/images";
import { TmdbImageClient } from "../../lib/api/tmdb/TmdbImageClient";
import { ImageClient } from "../../lib/api/ImageClient";
import { PreferredImage } from "../../types/PreferredImage";
import { MovieResponse } from "../movies/types/MovieResponse";
import path from 'path';
import { Log } from "../../lib/Logger";
import { removeFile } from "../../util/file";

interface Body {
  externalId: number;
}

interface Param {
  movieId: number;
}

export class UpdateMovieMetadataEndpoint extends PostEndpoint {
  private metadataClient: MetadataClient;
  private imageClient: ImageClient;

  constructor(emitter: EventEmitter, repository: RepositoryManager) {
    super('/movie/:movieId/update', emitter, repository);
    this.metadataClient = new TmdbMetadataClient('19065a8218d4c104a51afcc3e2a9b971'); // TODO: Centralize thi
    this.imageClient = new TmdbImageClient('19065a8218d4c104a51afcc3e2a9b971')
  }

  protected getValidator(): ValidationChain[] {
    return [
      param('movieId').isInt({ min: 0 }).toInt(),
      body('externalId').isInt({ min: 0 }).toInt()
    ]
  }
  protected async execute(data: RequestData<Body, unknown, Param>): Promise<MovieResponse> {
    const { movieId } = data.params;
    const { externalId } = data.body;
    const movie = await findMovieByIdWithPath(this.repository, movieId);
    const oldImages = await getMovieImages(this.repository, movieId);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }


    // Fetch metadata
    const metadata = await this.metadataClient.getMovieMetadataByExternalId(externalId);
    if (!metadata) {
      throw new NotFoundException(`No metadata found with external id ${externalId}`);
    }

    // Fetch cast and recommendations
    const cast = await this.metadataClient.getActorsInMovie(externalId);
    const recommendations = await this.metadataClient.getRecommendedMovies(externalId);
    // Filter out movies that we do not have in the database
    const existingRecommendations = (await this.repository.movie.findByExternalIds(recommendations))
      .map(movie => movie.id);

    // Fetch images
    const images = await this.imageClient.getMovieImages(externalId);
    // Download preferred images
    const imageFolder = path.join(movie.library.path, movie.directory, 'images');
    const downloadedImages = await Promise.all([
      downloadPreferredImage(this.imageClient, images.backdrops, imageFolder, ImageType.BACKDROP),
      downloadPreferredImage(this.imageClient, images.posters, imageFolder, ImageType.POSTER),
      downloadPreferredImage(this.imageClient, images.logos, imageFolder, ImageType.LOGO)
    ]).then(images => images.filter((img): img is PreferredImage => img !== undefined));

    // Update metadata
    await this.repository.movie.updateMetadata(movieId, metadata, cast, downloadedImages, existingRecommendations);

    // Delete old internal images
    oldImages.filter(image => image.source === ImageSource.INTERNAL)
      .forEach(image => removeFile(image.path));

    // Fetch updated movie
    const updated = await findMovieByIdWithMetadata(this.repository, movieId);
    Log.info(`Updated metadata for ${movie.name}, changed to ${metadata.title}`);
    return normalizeMovie(updated);
  }
}