import { EventEmitter } from "events";
import { TmdbImageClient } from "../api/tmdb/TmdbImageClient";
import { TmdbMetadataClient } from "../api/tmdb/TmdbMetadataClient";
import { Library } from "./Library";
import * as path from 'path';
import { Log } from "../Logger";
import { PreferredImage } from "../../types/PreferredImage";
import { Mutex } from "async-mutex";
import ParseException from "../../exceptions/ParseException";
import { AppDataSource } from "../../DataSource";
import { ShowRepository } from "../../repositories/ShowRepository";
import { EntityManager } from "typeorm";
import { Show } from "../../models/Show";
import { SeasonRepository } from "../../repositories/SeasonRepository";
import { EpisodeRepository } from "../../repositories/EpisodeRepository";
import { downloadPreferredImage } from "../api/util/images";
import { ImageType } from "../../models/Image";
import { ShowMetadataRepository } from "../../repositories/ShowMetadataRepository";
import { GenreRepository } from "../../repositories/GenreRepository";
import { ImageRepository } from "../../repositories/ImageRepository";
import { SeasonMetadataRepository } from "../../repositories/SeasonMetadataRepository";
import { EpisodeMetadataRepository } from "../../repositories/EpisodeMetadataRepository";
import { ImageCollection } from "../api/ImageClient";

export class ShowLibrary extends Library {
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

  /**
   * Removes an entry specified by the file path.
   * If the entry is an episode, it also removes the associated episode images.
   * If the episode is the last one in its season, it also removes the season and its associated season images.
   * If the season is the last one in its show, it also removes the show and its associated show images.
   * @param filePath The file path of the entry to be removed.
   * @returns A Promise that resolves when the entry and its associated images (if applicable) have been removed.
   * @throws If an error occurs while removing the entry.
   */
  protected async removeEntry(filePath: string): Promise<void> {
    AppDataSource.transaction(async (txn) => {
      // Delete episode
      const episode = await txn.withRepository(EpisodeRepository).findOneByPath(filePath);
      if (!episode) { return; } // Not saved, skip
      Log.info(`Removing season ${episode.seasonNumber} episode ${episode.episodeNumber} for the show with ID ${episode.showId}`);
      await txn.withRepository(EpisodeRepository).remove(episode);

      // Delete season
      const season = await txn.withRepository(SeasonRepository).findOneBySeasonInShow(episode.showId, episode.seasonNumber);
      if (!season) { return; } // Season not found, skip (shouldn't happen)
      console.log(season);
      if (season.episodes.length === 0) {
        Log.info(`No more episodes in season ${season.seasonNumber} for show with ID ${season.showId}. Removing the season from the database`);
        await txn.withRepository(SeasonRepository).remove(season);
      }

      // Delete show
      const show = await txn.withRepository(ShowRepository).findOneBy({ id: episode.showId });
      if (!show) { return; } // Show not found, skip (shouldn't happen)
      if (show.seasons.length === 0) {
        Log.info(`No more seasons in the show ${show?.name}, removing the show from the database`);
        await txn.withRepository(ShowRepository).remove(show);
      }
    });
  }

  protected async newSubtitle(filePath: string, language: string): Promise<boolean> {
    /*
    const { show: showPath } = this.getPaths(filePath);
    const seasonNumber = this.getSeasonNumber(filePath);
    const episodeNumber = this.getEpisodeNumber(filePath);

    if (Number.isNaN(seasonNumber) || Number.isNaN(episodeNumber)) {
      Log.warning(`Could't find a season or episode number for subtitle ${filePath}`);
      return false;
    }
    const show = await this.repository.show.findByPathInLibrary(showPath, this.id);
    if (!show) {
      Log.info(`Found a subtitle for a show that doesn't exist in the database for library ${this.name}`);
      return false;
    }
    const episode = await this.repository.episode.findByEpisodeInSeason(episodeNumber, seasonNumber, show.id);
    if (!episode) {
      Log.info(`Found a subtitle for an episode that doesn't exist in the database for library ${this.name}`);
      return false;
    }

    await this.repository.episode.addSubtitle(episode.id, language, filePath);
    Log.info(`Found ${language} subtitle for show ${show.name} season ${seasonNumber} episode ${episodeNumber} in library ${this.name}`);
    */
    return true;
  }

  /**
   * Adds a new entry to the library.
   * 
   * @param filePath - The path of the file to be added.
   * @returns A promise that resolves to a boolean indicating whether the entry was successfully added.
   * @throws {ParseException} If a season or episode number cannot be found for the given file path.
   */
  protected async newEntry(filePath: string): Promise<boolean> {
    const showData = this.getShowData(filePath);
    const seasonNumber = this.getSeasonNumber(filePath);
    const episodeNumber = this.getEpisodeNumber(filePath);
    const paths = this.getPaths(filePath);
    if (Number.isNaN(seasonNumber) || Number.isNaN(episodeNumber)) {
      throw new ParseException(`Could't find a season or episode number for ${filePath}`)
    }
    const { duration } = await this.getVideoData(filePath);

    return AppDataSource.transaction(async (txn) => {
      const txnShowRepository = txn.withRepository(ShowRepository);
      const txnSeasonRepository = txn.withRepository(SeasonRepository);
      const txnEpisodeRepository = txn.withRepository(EpisodeRepository);

      let show = await txnShowRepository.findOneByPathInLibrary(paths.show, this.id);
      if (!show) {
        Log.info(`Found a new show ${showData.title} (${paths.show} in library ${this.name})`);
        show = await this.saveShow(txn, showData.title, paths.show);
      }
      const season = await txnSeasonRepository.findOneBySeasonInShow(show.id, seasonNumber);
      if (!season) {
        Log.info(`Found a new season ${seasonNumber} for the show ${showData.title} in library ${this.name}`);
        await this.saveSeason(txn, show.id, seasonNumber, paths.season);
      }
      const episode = await txnEpisodeRepository.findOneByEpisodeInSeason(show.id, seasonNumber, episodeNumber);
      if (!episode) {
        Log.info(`Found ${showData.title} season ${seasonNumber} episode ${episodeNumber} in library ${this.name}`);
        await this.saveEpisode(txn, show.id, seasonNumber, episodeNumber, paths.episode, duration);
        return true;
      }
      return false;
    });
  }

  /**
   * Saves a show with the given show name and show path.
   * Retrieves show metadata and images, and creates a show with the metadata and preferred images.
   * If the show metadata is not found, creates a show without metadata.
   * @param showName The name of the show.
   * @param showPath The path where the show will be saved.
   * @returns A promise that resolves to the created show.
   */
  private async saveShow(txn: EntityManager, showName: string, showPath: string): Promise<Show> {
    const metadata = await this.metadataClient.getShowMetadata(showName);
    if (!metadata) {
      const entity = txn.withRepository(ShowRepository).create({
        library: { id: this.id },
        name: showName,
        path: showPath,
        seasons: []
      });
      return txn.withRepository(ShowRepository).save(entity);
    }

    // Create images
    const images = await this.imageClient.getShowImages(metadata.externalId)
      .then(images => this.downloadImageCollection(images));

    const imageEntities = images
      .map(image => txn.withRepository(ImageRepository).create({
        data: image.data,
        preferred: image.preferred,
        type: image.type
      }));

    // Create genres
    const genreEntities = await Promise.all(metadata.genres
      .map(genre => ({ name: genre }))
      .map(genre => txn.withRepository(GenreRepository).createIfNotExist(genre))
    );

    const metadataEntity = txn.withRepository(ShowMetadataRepository).create({
      title: metadata.title,
      overview: metadata.overview,
      firstAirDate: metadata.firstAirDate,
      popularity: metadata.popularity,
      externalId: metadata.externalId,
      genres: genreEntities,
      images: imageEntities,
    });
    const showEntity = txn.withRepository(ShowRepository).create({
      library: { id: this.id },
      name: showName,
      path: showPath,
      metadata: metadataEntity,
      seasons: [],
    });
    return txn.withRepository(ShowRepository).save(showEntity);
  }

  /**
   * Saves a season for a show.
   * 
   * @param showId - The ID of the show.
   * @param seasonNumber - The number of the season.
   * @param seasonPath - The path of the season.
   * @returns A promise that resolves to the created season.
   * @throws An error if the show is not found.
   */
  private async saveSeason(txn: EntityManager, showId: number, seasonNumber: number, seasonPath: string) {
    const createWithoutMetadata = () => txn.withRepository(SeasonRepository).create({
      show: { id: showId },
      seasonNumber,
      path: seasonPath,
      episodes: [],
    });

    const show = await txn.withRepository(ShowRepository).findOneBy({ id: showId });
    if (!show) {
      throw new Error(`Show with ID ${showId} not found when trying to save season`);
    }
    const externalShowId = show.metadata?.externalId;
    if (externalShowId === undefined) {
      return txn.withRepository(SeasonRepository).save(createWithoutMetadata());
    }
    const metadata = await this.metadataClient.getSeasonMetadata(externalShowId, seasonNumber);
    if (!metadata) {
      return txn.withRepository(SeasonRepository).save(createWithoutMetadata());
    }

    // Create images
    const images = await this.imageClient.getSeasonImages(externalShowId, seasonNumber)
      .then(images => this.downloadImageCollection(images));

    const imageEntities = images
      .map(image => txn.withRepository(ImageRepository).create({
        data: image.data,
        preferred: image.preferred,
        type: image.type
      }));

    const metadataEntity = txn.withRepository(SeasonMetadataRepository).create({
      airDate: metadata.airDate,
      overview: metadata.overview,
      title: metadata.name,
      images: imageEntities,
      showId, // Why do I have to specify this here?
      seasonNumber, // Why do I have to specify this here?
    });
    const seasonEntity = txn.withRepository(SeasonRepository).create({
      showId,
      seasonNumber,
      path: seasonPath,
      metadata: metadataEntity,
      episodes: [],
    });
    return txn.withRepository(SeasonRepository).save(seasonEntity);
  }


  /**
   * Saves an episode of a show.
   * 
   * @param showId - The ID of the show.
   * @param seasonNumber - The season number of the episode.
   * @param episodeNumber - The episode number.
   * @param episodePath - The path of the episode.
   * @returns A promise that resolves to the created episode.
   * @throws Error if the show or season is not present.
   */
  private async saveEpisode(
    txn: EntityManager,
    showId: number,
    seasonNumber: number,
    episodeNumber: number,
    episodePath: string,
    duration?: number
  ) {
    const createWithoutMetadata = () => txn.withRepository(EpisodeRepository).create({
      seasonNumber,
      showId,
      episodeNumber,
      path: episodePath,
      duration
    });

    const txnShowRepository = txn.withRepository(ShowRepository);
    const show = await txnShowRepository.findOne({ where: { id: showId }, relations: ['seasons'] });
    if (!show || !show.seasons.find(season => season.seasonNumber === seasonNumber)) {
      throw new Error(`Show or season not present when trying to save episode`);
    }
    const externalShowId = show.metadata?.externalId;
    if (externalShowId === undefined) {
      return txn.withRepository(EpisodeRepository).save(createWithoutMetadata());
    }
    const metadata = await this.metadataClient.getEpisodeMetadata(externalShowId, seasonNumber, episodeNumber);
    if (!metadata) {
      return txn.withRepository(EpisodeRepository).save(createWithoutMetadata());
    }

    // Create images
    const images = await this.imageClient.getEpisodeImages(externalShowId, seasonNumber, episodeNumber)
      .then(images => this.downloadImageCollection(images));

    const imageEntities = images
      .map(image => txn.withRepository(ImageRepository).create({
        data: image.data,
        preferred: image.preferred,
        type: image.type
      }));

    const metadataEntity = txn.withRepository(EpisodeMetadataRepository).create({
      episodeNumber, // Why do I have to specify this here?
      seasonNumber, // Why do I have to specify this here?
      showId, // Why do I have to specify this here?
      images: imageEntities,
      overview: metadata.overview,
      title: metadata.name,
      voteAverage: metadata.voteAverage,
      airDate: metadata.airDate,
    });
    const episodeEntity = txn.withRepository(EpisodeRepository).create({
      seasonNumber,
      showId,
      episodeNumber,
      metadata: metadataEntity,
      duration,
      path: episodePath,
    });
    return txn.withRepository(EpisodeRepository).save(episodeEntity);
  }

  private downloadImageCollection(images: ImageCollection) {
    return Promise.all([
      downloadPreferredImage(this.imageClient, images.backdrops, ImageType.BACKDROP),
      downloadPreferredImage(this.imageClient, images.posters, ImageType.POSTER),
      downloadPreferredImage(this.imageClient, images.logos, ImageType.LOGO)
    ])
      .then(images => images.filter((img): img is PreferredImage => img !== undefined));
  }

  private getPaths(filePath: string) {
    return {
      show: path.dirname(path.dirname(filePath)),
      season: path.dirname(filePath),
      episode: filePath
    }
  }

  private getShowData(filePath: string) {
    const dirname = path.dirname(path.dirname(filePath));
    return this.getFileMetadata(dirname);
  }

  private getSeasonNumber(filePath: string): number {
    // Ex: /a/b/c/Show Name/Season 1/S01E01.mp4. This returns "Season 1"
    const dirname = path.basename(path.dirname(filePath));
    return parseInt(dirname.replace(/^\D+/g, ''));
  }

  private getEpisodeNumber(filePath: string): number {
    const fileName = path.basename(filePath);
    let re = new RegExp("[S|s]\\d+[E|e](\\d+)", 'gm');
    let matches = re.exec(fileName);
    if (matches !== null && matches.length > 1) {
      return parseInt(matches[1]);
    } else {
      re = new RegExp("\\d+x(\\d+)", 'gm');
      matches = re.exec(fileName);
      return matches !== null && matches.length > 1 ? parseInt(matches[1]) : NaN;
    }
  }
}