import { EventEmitter } from "events";
import { ImageType, Library as LibraryModel } from "@prisma/client";
import { ImageClient } from "../api/ImageClient";
import { MetadataClient } from "../api/MetadataClient";
import { TmdbImageClient } from "../api/tmdb/TmdbImageClient";
import { TmdbMetadataClient } from "../api/tmdb/TmdbMetadataClient";
import { RepositoryManager } from "../repository";
import { Library } from "./Library";
import * as path from 'path';
import { Log } from "../Logger";
import { PreferredImage } from "../../types/PreferredImage";
import { removeFile } from "../../util/file";
import { Mutex } from "async-mutex";
import ParseException from "../../exceptions/ParseException";

export class ShowLibrary extends Library {
  private mutex = new Mutex();

  constructor(model: LibraryModel, repository: RepositoryManager, emitter: EventEmitter) {
    super(
      model,
      repository,
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
    this.mutex.acquire();
    try {
      // Delete episode
      const episode = await this.repository.episode.findByPath(filePath, {
        metadata: {
          include: {
            images: true
          }
        }
      });
      if (!episode) { return; } // Not saved, skip
      Log.info(`Removing season ${episode.seasonNumber} episode ${episode.episodeNumber} for the show with ID ${episode.showId}`);
      // Remove episode and episode images
      await this.repository.episode.deleteByPath(filePath);
      let images = (episode.metadata?.images || [])
        .map(image => image.path);
      await Promise.all(images.map(image => removeFile(image)));

      // Delete season if last episode was deleted
      const season = await this.repository.season.findBySeasonInShow(episode.seasonNumber, episode.showId, {
        episodes: true,
        seasonMetadata: {
          include: {
            images: true
          }
        }
      });
      if (!season) { return; } // Season not found, skip (shouldn't happen)
      if (season.episodes.length === 0) {
        Log.info(`No more episodes in season ${season.seasonNumber} for show with ID ${season.showId}. Removing the season from the database`);
        // Remove season and season images
        await this.repository.season.deleteBySeasonInShow(episode.seasonNumber, episode.showId);
        let images = (season.seasonMetadata?.images || [])
          .map(image => image.path);
        await Promise.all(images.map(image => removeFile(image)));
      }

      // Delete show if last season was deleted
      const show = await this.repository.show.findById(episode.showId, {
        include: {
          seasons: true,
          showMetadata: {
            include: {
              images: true
            }
          }
        }
      });
      if (!show) { return; } // Show not found, skip (shouldn't happen)
      if (show.seasons.length === 0) {
        Log.info(`No more seasons in the show ${show?.name}, removing the show from the database`);
        // Remove show and show images
        await this.repository.show.deleteById(episode.showId);
        let images = (show.showMetadata?.images || [])
          .map(image => image.path);
        await Promise.all(images.map(image => removeFile(image)));
      }
    } catch (error) {
      Log.error('Error when removing episode');
      throw error;
    } finally {
      this.mutex.release();
    }
  }

  protected async newSubtitle(filePath: string, language: string): Promise<boolean> {
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

    await this.mutex.acquire();
    try {
      let show = await this.repository.show.findByPathInLibrary(paths.show, this.id);
      let showId = show?.id;
      if (showId === undefined) {
        Log.info(`Found a new show ${showData.title} (${paths.show} in library ${this.name})`);
        showId = (await this.saveShow(showData.title, paths.show)).id;
      }
      const season = await this.repository.season.findBySeasonInShow(seasonNumber, showId, {});
      if (season === null) {
        Log.info(`Found a new season ${seasonNumber} for the show ${showData.title} in library ${this.name}`);
        await this.saveSeason(showId, seasonNumber, paths.season);
      }
      const episode = await this.repository.episode.findByEpisodeInSeason(episodeNumber, seasonNumber, showId);
      if (episode === null) {
        Log.info(`Found ${showData.title} season ${seasonNumber} episode ${episodeNumber} in library ${this.name}`);
        const result = await this.saveEpisode(showId, seasonNumber, episodeNumber, paths.episode, duration);
        this.emitter.emit('episode:added', result.id);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      Log.error('Error when adding episode');
      throw error;
    } finally {
      this.mutex.release();
    }
  }

  /**
   * Saves a show with the given show name and show path.
   * Retrieves show metadata and images, and creates a show with the metadata and preferred images.
   * If the show metadata is not found, creates a show without metadata.
   * @param showName The name of the show.
   * @param showPath The path where the show will be saved.
   * @returns A promise that resolves to the created show.
   */
  private async saveShow(showName: string, showPath: string) {
    const metadata = await this.metadataClient.getShowMetadata(showName);
    if (metadata === undefined) {
      return this.repository.show.createWithoutMetadata(showPath, this.id, showName);
    }
    const images = await this.imageClient.getShowImages(metadata.externalId);
    const imageFolder = path.join(this.path, showPath, 'images');
    const [backdropResult, posterResult, logoResult] = await Promise.all([
      this.downloadPreferredImage(images.backdrops, imageFolder, ImageType.BACKDROP),
      this.downloadPreferredImage(images.posters, imageFolder, ImageType.POSTER),
      this.downloadPreferredImage(images.logos, imageFolder, ImageType.LOGO)
    ]);
    const imagesToSave: PreferredImage[] = [backdropResult, posterResult, logoResult]
      .filter((img): img is PreferredImage => img !== undefined);
    return this.repository.show.createWithMetadata(this.id, showPath, metadata, imagesToSave);
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
  private async saveSeason(showId: number, seasonNumber: number, seasonPath: string) {
    const show = await this.repository.show.findById(showId, { include: { showMetadata: true } });
    if (show === null) {
      throw new Error('Show was undefined when trying to save season');
    }
    const externalShowId = show.showMetadata?.externalId;
    if (externalShowId === undefined) {
      return this.repository.season.createWithoutMetadata(show.id, seasonNumber, seasonPath)
    }
    const metadata = await this.metadataClient.getSeasonMetadata(externalShowId, seasonNumber);
    if (metadata === undefined) {
      return this.repository.season.createWithoutMetadata(show.id, seasonNumber, seasonPath)
    }

    const images = await this.imageClient.getSeasonImages(externalShowId, seasonNumber);
    // TODO: Move this to own function?
    const imageFolder = path.join(this.path, seasonPath, 'images');
    const [backdropResult, posterResult, logoResult] = await Promise.all([
      this.downloadPreferredImage(images.backdrops, imageFolder, ImageType.BACKDROP),
      this.downloadPreferredImage(images.posters, imageFolder, ImageType.POSTER),
      this.downloadPreferredImage(images.logos, imageFolder, ImageType.LOGO)
    ]);
    const imagesToSave: PreferredImage[] = [backdropResult, posterResult, logoResult]
      .filter((img): img is PreferredImage => img !== undefined);
    return this.repository.season.createWithMetadata(showId, seasonNumber, seasonPath, metadata, imagesToSave);
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
    showId: number,
    seasonNumber: number,
    episodeNumber: number,
    episodePath: string,
    duration?: number
  ) {
    const show = await this.repository.show.findById(showId, { include: { seasons: true, showMetadata: true } });
    if (show === null || !show.seasons.find(season => season.seasonNumber === seasonNumber)) {
      throw new Error(`Show or season not present when trying to save episode`);
    }
    const externalShowId = show.showMetadata?.externalId;
    if (externalShowId === undefined) {
      return this.repository.episode.createWithoutMetadata(
        showId,
        seasonNumber,
        episodeNumber,
        episodePath,
        duration
      );
    }
    const metadata = await this.metadataClient.getEpisodeMetadata(externalShowId, seasonNumber, episodeNumber);
    if (metadata === undefined) {
      return this.repository.episode.createWithoutMetadata(
        showId,
        seasonNumber,
        episodeNumber,
        episodePath,
        duration
      );
    }

    const images = await this.imageClient.getEpisodeImages(externalShowId, seasonNumber, episodeNumber);
    // TODO: Move this to own function?
    const imageFolder = path.join(this.path, path.dirname(episodePath), 'images');
    const [backdropResult, posterResult, logoResult] = await Promise.all([
      this.downloadPreferredImage(images.backdrops, imageFolder, ImageType.BACKDROP),
      this.downloadPreferredImage(images.posters, imageFolder, ImageType.POSTER),
      this.downloadPreferredImage(images.logos, imageFolder, ImageType.LOGO)
    ]);
    const imagesToSave: PreferredImage[] = [backdropResult, posterResult, logoResult]
      .filter((img): img is PreferredImage => img !== undefined);
    return this.repository.episode.createWithMetadata(
      showId,
      seasonNumber,
      episodeNumber,
      episodePath,
      metadata,
      imagesToSave,
      duration
    );
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