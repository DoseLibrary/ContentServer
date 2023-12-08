import { EventEmitter } from "events";
import { Library as LibraryModel, ImageType } from "@prisma/client";
import { Log } from "../Logger";
import { Cast, MovieMetadata } from "../api/MetadataClient";
import { Library } from "./Library";
import { TmdbMetadataClient } from "../api/tmdb/TmdbMetadataClient";
import { TmdbImageClient } from "../api/tmdb/TmdbImageClient";
import { removeDir } from "../../util/file";
import path from 'path';
import { PreferredImage } from "../../types/PreferredImage";
import { RepositoryManager } from "../repository";

export class MovieLibrary extends Library {

  constructor(model: LibraryModel, repository: RepositoryManager, emitter: EventEmitter) {
    super(
      model,
      repository,
      new TmdbMetadataClient('19065a8218d4c104a51afcc3e2a9b971'),
      new TmdbImageClient('19065a8218d4c104a51afcc3e2a9b971'),
      emitter
    );
  }

  protected async removeEntry(filePath: string): Promise<void> {
    const { fileName, dirName } = this.getFileMetadata(filePath);
    const movie = await this.repository.movie.findByPathInLibrary(dirName, fileName, this.id);
    if (!movie) {
      return;
    }
    return this.repository.movie.deleteById(movie.id)
      .then(() => {
        const imageFolder = path.join(this.path, path.dirname(filePath), 'images');
        return removeDir(imageFolder);
      })
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
    const { dirName } = this.getFileMetadata(filePath);
    const movie = await this.getMovieFromSubtitleDirname(dirName);
    if (!movie) {
      Log.info(`Found a subtitle for a movie that doesn't exist in the database for library ${this.name}`);
      return false;
    }
    Log.info(`Found ${language} subtitle for movie ${movie.name} in library ${this.name}`);
    await this.repository.movie.addSubtitle(movie.id, language, filePath);
    return true;
  }

  /**
   * Creates a new entry in the movie library based on the provided file path.
   * 
   * @param filePath - The path of the movie file.
   * @returns A promise that resolves to a boolean indicating whether the new entry was successfully created.
   */
  protected async newEntry(filePath: string): Promise<boolean> {
    const { title, fileName, dirName, possibleReleaseYears } = this.getFileMetadata(filePath);
    const { duration } = await this.getVideoData(filePath);
    const movieExists = await this.movieExists(dirName, fileName);
    if (movieExists) {
      return false;
    }
    Log.info(`Found a new movie ${title} (${filePath} for library: '${this.name}')`);

    // TODO: Extract subtitles: (Should maybe be a job instead?)
    const metadataByYear = (await Promise.all(possibleReleaseYears.map(year =>
      this.metadataClient.getMovieMetadataByYear(title, year))
    )).filter(Boolean);

    const metadata = metadataByYear.length > 0 ?
      metadataByYear[0] :
      await this.metadataClient.getMovieMetadata(title);

    if (!metadata) {
      Log.debug(`No metadata found for ${title}`);
      const result = await this.saveMovieWithoutMetadata(title, dirName, fileName, duration);
      this.emitter.emit('movie:added', result.id);
    } else {
      Log.debug(`Found metadata for ${title}`);
      const recommendations = await this.metadataClient.getRecommendedMovies(metadata.externalId);
      const existingRecommendations = await this.repository.movie.findByExternalIds(recommendations);
      const cast = await this.metadataClient.getActorsInMovie(metadata.externalId);

      const images = await this.imageClient.getMovieImages(metadata.externalId);
      const imageFolder = path.join(this.path, path.dirname(filePath), 'images');
      const [backdropResult, posterResult, logoResult] = await Promise.all([
        this.downloadPreferredImage(images.backdrops, imageFolder, ImageType.BACKDROP),
        this.downloadPreferredImage(images.posters, imageFolder, ImageType.POSTER),
        this.downloadPreferredImage(images.logos, imageFolder, ImageType.LOGO)
      ]);

      const result = await this.saveMovieWithMetadata(
        metadata,
        cast,
        dirName,
        fileName,
        existingRecommendations.map(recommendation => recommendation.id),
        backdropResult,
        posterResult,
        logoResult,
        duration
      );
      this.emitter.emit('movie:added', result.id);
    }
    return true;
  }

  private saveMovieWithoutMetadata(title: string, directory: string, file: string, duration?: number) {
    return this.repository.movie.createWithoutMetadata(directory, file, title, this.id, duration);
  }

  private saveMovieWithMetadata(
    metadata: MovieMetadata,
    cast: Cast[],
    directory: string,
    file: string,
    recommendations: number[],
    backdrop?: PreferredImage,
    poster?: PreferredImage,
    logo?: PreferredImage,
    duration?: number
  ) {
    const images: PreferredImage[] = [backdrop, poster, logo]
      .filter((img): img is PreferredImage => img !== undefined);

    return this.repository.movie.createWithMetadata(this.id, directory, file, metadata, cast, images, recommendations, duration);
  }

  private async movieExists(dir: string, file: string) {
    const data = await this.repository.movie.findByPathInLibrary(dir, file, this.id);
    return data !== null;
  }

  private async getMovieFromSubtitleDirname(dirName: string) {
    let movie = await this.repository.movie.findByDirectoryInLibrary(dirName, this.id);
    if (!movie) {
      // Might be a problem here if the parentDirName is the same as the library path (root)
      const parentDirName = path.dirname(dirName);
      movie = await this.repository.movie.findByDirectoryInLibrary(parentDirName, this.id);
    }
    return movie || undefined;
  }
}