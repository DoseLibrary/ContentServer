import { EventEmitter } from "events";
import { Log } from "../Logger";
import { Cast, MovieMetadata } from "../api/MetadataClient";
import { Library } from "./Library";
import { TmdbMetadataClient } from "../api/tmdb/TmdbMetadataClient";
import { TmdbImageClient } from "../api/tmdb/TmdbImageClient";
import { removeDir } from "../../util/file";
import path from 'path';
import { PreferredImage } from "../../types/PreferredImage";
import { downloadPreferredImage } from "../api/util/images";
import { AppDataSource } from "../../DataSource";
import { MovieRepository } from "../../repositories/MovieRepository";
import { ImageType } from "../../models/Image";
import { MovieMetadataRepository } from "../../repositories/MovieMetadataRepository";
import { ActorRepository } from "../../repositories/ActorRepository";
import { ImageRepository } from "../../repositories/ImageRepository";
import { GenreRepository } from "../../repositories/GenreRepository";
import { MovieCharacterRepository } from "../../repositories/MovieCharacterRepository";
import { Mutex } from "async-mutex";

export class MovieLibrary extends Library {
  private mutex = new Mutex();

  constructor(
    id: number,
    name: string,
    path: string,
    emitter: EventEmitter
  ) {
    super(
      id,
      name,
      path,
      new TmdbMetadataClient('19065a8218d4c104a51afcc3e2a9b971'),
      new TmdbImageClient('19065a8218d4c104a51afcc3e2a9b971'),
      emitter
    );
  }

  protected async removeEntry(filePath: string): Promise<void> {
    const movie = await MovieRepository.findOneByPathInLibrary(filePath, this.id);
    if (!movie) {
      return;
    }
    return MovieRepository.delete(movie.id)
      .then(() => Log.info(`Removed movie ${movie.name} from ${this.name}`));
  }


  /**
   * Adds a new subtitle to the movie library.
   * 
   * @param filePath - The file path of the subtitle.
   * @param language - The language of the subtitle.
   * @returns A promise that resolves when the subtitle is added.
   */
  protected async newSubtitle(filePath: string, language: string): Promise<boolean> {
    /*
    const { dirName } = this.getFileMetadata(filePath);
    const movie = await this.getMovieFromSubtitleDirname(dirName);
    if (!movie) {
      Log.info(`Found a subtitle for a movie that doesn't exist in the database for library ${this.name}`);
      return false;
    }
    Log.info(`Found ${language} subtitle for movie ${movie.name} in library ${this.name}`);
    await this.repository.movie.addSubtitle(movie.id, language, filePath);
    */
    return true;
  }

  /**
   * Creates a new entry in the movie library based on the provided file path.
   * 
   * @param filePath - The path of the movie file.
   * @returns A promise that resolves to a boolean indicating whether the new entry was successfully created.
   */
  protected async newEntry(filePath: string): Promise<boolean> {
    // TODO: Race condition, if two movies are added at the same time the recommendation check can fail
    const { title, possibleReleaseYears } = this.getFileMetadata(filePath);
    const { duration } = await this.getVideoData(filePath);
    const movieExists = await this.movieExists(filePath);
    if (movieExists) {
      return false;
    }
    Log.info(`Found a new movie ${title} (${filePath} for library: '${this.name}')`);

    const metadataByYear = (await Promise.all(possibleReleaseYears.map(year =>
      this.metadataClient.getMovieMetadataByYear(title, year))
    )).filter(Boolean);
    const metadata = metadataByYear[0] || await this.metadataClient.getMovieMetadata(title);

    if (!metadata) {
      Log.debug(`No metadata found for ${title}`);
      const movie = MovieRepository.create({
        duration,
        library: { id: this.id },
        name: title,
        path: filePath,
      });
      const result = await MovieRepository.save(movie);
      this.emitter.emit('movie:added', result.id);
    } else {
      const release = await this.mutex.acquire();
      try {
        Log.debug(`Found metadata for ${title}`);
        const recommendations = await this.metadataClient.getRecommendedMovies(metadata.externalId);
        const existingRecommendations = await MovieRepository.findByExternalIds(recommendations);
        const cast = await this.metadataClient.getActorsInMovie(metadata.externalId);

        const images = await this.downloadMovieImages(metadata.externalId);

        await this.saveMovieWithMetadata(
          metadata,
          cast,
          filePath,
          existingRecommendations.map(movie => movie.id),
          images,
          duration
        );
        // TODO: Emit event
      } finally {
        release();
      }
    }
    return true;
  }

  private downloadMovieImages(externalId: number) {
    return this.imageClient.getMovieImages(externalId)
      .then(images => Promise.all([
        downloadPreferredImage(this.imageClient, images.backdrops, ImageType.BACKDROP),
        downloadPreferredImage(this.imageClient, images.posters, ImageType.POSTER),
        downloadPreferredImage(this.imageClient, images.logos, ImageType.LOGO)
      ]))
      .then(images => images.filter((img): img is PreferredImage => img !== undefined));
  }

  private async saveMovieWithMetadata(
    metadata: MovieMetadata,
    cast: Cast[],
    filePath: string,
    recommendations: number[],
    images: PreferredImage[],
    duration?: number
  ) {
    return AppDataSource.transaction(async (manager) => {
      const txnMovieRepo = manager.withRepository(MovieRepository);
      const txnMovieMetadataRepo = manager.withRepository(MovieMetadataRepository);
      const txnMovieCharacterRepo = manager.withRepository(MovieCharacterRepository);
      const txnActorRepo = manager.withRepository(ActorRepository);
      const txnImageRepo = manager.withRepository(ImageRepository);
      const txnGenreRepo = manager.withRepository(GenreRepository);

      // Create actors
      const actors = await Promise.all(cast
        .map(async (actor) => {
          const buffer = actor.image ? await this.imageClient.downloadImage(actor.image) : undefined;
          // Create image if it exists
          const image = buffer ? txnImageRepo.create({
            data: buffer.toString('base64'),
            preferred: true,
            type: ImageType.POSTER,
          }) : undefined;
          const entity = {
            id: actor.id,
            name: actor.name,
            images: image ? [image] : [],
          };
          return txnActorRepo.createIfNotExist(entity);
        }));

      // Create characters
      const characters = cast.map(actor => txnMovieCharacterRepo.create({
        actor: actors.find(a => a.id === actor.id)!,
        name: actor.character,
        orderInCredit: actor.orderInCredit,
      }));

      // Create genres
      const genres = await Promise.all(metadata.genres
        .map(genre => ({ name: genre }))
        .map(genre => txnGenreRepo.createIfNotExist(genre)));

      // Create images
      const imageEntities = images
        .filter((img): img is PreferredImage => img !== undefined)
        .map(image => txnImageRepo.create({
          data: image.data,
          preferred: image.preferred,
          type: image.type,
        }));

      // Create metadata
      const movieMetadata = txnMovieMetadataRepo.create({
        characters,
        externalId: metadata.externalId,
        genres,
        images: imageEntities,
        overview: metadata.overview,
        recommendations: recommendations.map(id => ({
          movieId: id
        })),
        title: metadata.title,
        releaseDate: metadata.releaseDate,
        popular: false,
      });

      // Create movie
      const movie = txnMovieRepo.create({
        duration,
        library: { id: this.id },
        name: metadata.title,
        metadata: movieMetadata,
        path: filePath,
      });
      await txnMovieRepo.save(movie);
    });
  }

  private async movieExists(filePath: string) {
    const movie = await MovieRepository.findOneByPathInLibrary(filePath, this.id);
    return movie !== null;
  }

  private async getMovieFromSubtitleDirname(dirName: string) {
    /*
    let movie = await this.repository.movie.findByDirectoryInLibrary(dirName, this.id);
    if (!movie) {
      // Might be a problem here if the parentDirName is the same as the library path (root)
      const parentDirName = path.dirname(dirName);
      movie = await this.repository.movie.findByDirectoryInLibrary(parentDirName, this.id);
    }
    return movie || undefined;
    */
  }
}