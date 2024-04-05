import { EventEmitter } from "events";
import path from 'path';
import UnsuportedFormatException from "../../exceptions/UnsupportedFormat";
import { valueExistInEnum } from "../../util/enum";
import { ImageClient } from "../api/ImageClient";
import { MetadataClient } from "../api/MetadataClient";
import { getDurationFromVideoMetadata, getVideoMetadata } from "../../util/video";
import { getLanguageNameFromCode, getLanguageNameFromString } from "../../util/language";
import { Mutex } from 'async-mutex';

enum SupportedVideoFormats {
  MP4 = '.mp4',
  TS = '.ts',
  MKV = '.mkv',
  WEBM = '.webm',
  AVI = '.avi',
  M4V = '.m4v'
}

enum SupportedSubtitleFormats {
  SRT = '.srt',
  VTT = '.vtt',
  SUB = '.sub'
}

interface FileMetadata {
  fileName: string;
  dirName: string;
  title: string;
  possibleReleaseYears: number[];
};

export abstract class Library {
  private _id: number;
  private _name: string;
  private _path: string;
  private subtitleMutex = new Mutex();
  private waitingSubtitles: string[] = []; // Path to subtitle files
  protected metadataClient: MetadataClient;
  protected imageClient: ImageClient;
  protected emitter: EventEmitter;

  constructor(
    id: number,
    name: string,
    path: string,
    metadataClient: MetadataClient,
    imageClient: ImageClient,
    emitter: EventEmitter
  ) {
    this._id = id;
    this._name = name;
    this._path = path;
    this.metadataClient = metadataClient;
    this.imageClient = imageClient;
    this.emitter = emitter;
  }

  get id() { return this._id }
  get name() { return this._name }
  get path() { return this._path }

  protected abstract newEntry(path: string): Promise<boolean>;
  protected abstract removeEntry(path: string): Promise<void>;
  protected abstract newSubtitle(path: string, language: string): Promise<boolean>;

  /**
   * Handles a new entry by determining its file type and adding it to the library.
   * If the file is a video, it will be added as a video entry.
   * If the file is a subtitle, it will be added as a subtitle entry.
   * Throws an error if the file format is not supported.
   * @param filePath The path of the file to handle.
   * @returns A promise that resolves when the entry has been added to the library.
   */
  public async handleNewEntry(filePath: string): Promise<void> {
    const fileName = path.parse(filePath).name;
    if (fileName === 'trailer') {
      return;
    }

    const fileExtension = path.extname(filePath);
    if (valueExistInEnum(SupportedVideoFormats, fileExtension)) {
      await this.tryAddVideo(filePath);
    } else if (valueExistInEnum(SupportedSubtitleFormats, fileExtension)) {
      await this.tryAddSubtitle(filePath, fileName);
    } else {
      throw new UnsuportedFormatException(fileExtension);
    }
  }

  public handleRemovedEntry(filePath: string): Promise<void> {
    return this.removeEntry(filePath);
  }

  protected async getVideoData(filePath: string) {
    const fullPath = path.join(this.path, filePath);
    const metadata = await getVideoMetadata(fullPath);
    const duration = metadata !== undefined ? getDurationFromVideoMetadata(metadata) : undefined;
    return {
      duration
    };
  }

  protected getFileMetadata(filePath: string): FileMetadata {
    const title = this.getTitle(filePath);
    const possibleReleaseYears = this.getReleaseYears(filePath);

    return {
      title,
      dirName: path.dirname(filePath),
      fileName: path.basename(filePath),
      possibleReleaseYears
    };
  }

  /**
   * Tries to add a video file to the library.
   * 
   * @param filePath - The path of the video file.
   */
  private async tryAddVideo(filePath: string) {
    const entryAdded = await this.newEntry(filePath);
    if (entryAdded) {
      await this.tryAddWaitingSubtitles(filePath);
    }
  }

  /**
   * Tries to add a subtitle to the library.
   * If the subtitle is not added, it will be added to the waiting subtitles.
   * @param filePath - The path of the subtitle file.
   * @param fileName - The name of the subtitle file.
   */
  private async tryAddSubtitle(filePath: string, fileName: string) {
    /*
    await this.subtitleMutex.acquire();
    try {
      const alreadyAdded = await this.repository.subtitle.findByPath(filePath) !== null;
      if (!alreadyAdded) {
        const language = this.getSubtitleLanguage(fileName);
        const added = await this.newSubtitle(filePath, language);
        if (!added) {
          this.waitingSubtitles.push(filePath);
        }
      }
    } finally {
      this.subtitleMutex.release();
    }
    */
  }

  /**
   * Tries to add waiting subtitles for a given file path.
   * @param filePath - The file path to check for waiting subtitles.
   * @returns A promise that resolves when all waiting subtitles are processed.
   */
  private async tryAddWaitingSubtitles(filePath: string) {
    await this.subtitleMutex.acquire();
    try {
      const subtitles = this.waitingSubtitles.filter(subtitle => subtitle.startsWith(path.dirname(filePath)));
      for (const subtitle of subtitles) {
        const language = this.getSubtitleLanguage(path.parse(subtitle).name);
        const added = await this.newSubtitle(subtitle, language);
        if (added) {
          this.waitingSubtitles.splice(this.waitingSubtitles.indexOf(subtitle), 1);
        }
      }
    } finally {
      this.subtitleMutex.release();
    }
  }

  private getTitle(filePath: string): string {
    const fileName = path.basename(filePath);
    const re = new RegExp("([& .A-zÀ-ú\\d_'()!-]+?)(\\W\\d{4}\\W?.*)", 'gm');
    const matches = re.exec(fileName);
    if (matches !== null && matches.length > 1) {
      return matches[1].replace(/\./g, ' ').trim();
    }
    return fileName;
  }

  private getReleaseYears(filePath: string): number[] {
    const re = new RegExp("[\\.(](\\d{4})[\\.)]", "gm");
    const matches = re.exec(filePath);
    const result: number[] = [];
    if (matches !== null) {
      for (let i = 1; i < matches.length; i++) {
        const year = parseInt(matches[i]);
        if (!isNaN(year)) {
          result.push(year);
        }
      }
    }
    return result;
  }

  /*
  protected downloadPreferredImage(images: Image[], downloadPath: string, type: ImageType): Promise<PreferredImage | undefined> {
    return downloadPreferredImage(this.imageClient, images, downloadPath, type);
  }
  */

  private getSubtitleLanguage(fileName: string): string {
    const dotSplit = fileName.split('.');
    const dashSplit = fileName.split('-');
    const underscoreSplit = fileName.split('_');

    // Include all the splits in an array if they are not empty
    const splits = [dotSplit, dashSplit, underscoreSplit].filter(split => split.length > 1).flat();

    for (const split of splits) {
      const language = getLanguageNameFromCode(split);
      if (language !== 'Unknown') {
        return language;
      }
    }
    return 'Unknown';
  }
}