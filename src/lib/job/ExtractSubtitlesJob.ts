import { EventEmitter } from "events";
import { RepositoryManager } from "../repository";
import { Job } from "./Job";
import Queue from "../../util/Queue";
import { findMovieByIdWithPath } from "../queries/movieQueries";
import path from 'path';
import fs from 'fs';
import { getSubtitleStreamsFromMetadata, getVideoMetadata } from "../../util/video";
import { Log } from "../Logger";
import Transcoding from "../transcodings/Transcoding";

export class ExtractSubtitlesJob extends Job {
  private repository: RepositoryManager;
  private emitter: EventEmitter;
  private movieQueue: Queue<number>; // Movie ids
  private episodeQueue: Queue<number>; // Episode ids

  constructor(repository: RepositoryManager, emitter: EventEmitter) {
    super({
      useInterval: false,
      runAtStart: true
    });
    this.repository = repository;
    this.emitter = emitter;
    this.movieQueue = new Queue<number>();
    this.episodeQueue = new Queue<number>();

    this.onMovieAdded = this.onMovieAdded.bind(this);
    this.onEpisodeAdded = this.onEpisodeAdded.bind(this);

    this.emitter.on('movie:added', this.onMovieAdded);
    this.emitter.on('episode:added', this.onEpisodeAdded);
  }

  protected async execute(): Promise<void> {
    await this.initializeQueues();
    while (true) {
      if (!this.movieQueue.isEmpty()) {
        const movieId = this.movieQueue.dequeue();
        if (movieId) {
          await this.processMovie(movieId);
        }
      }

      if (!this.episodeQueue.isEmpty()) {
        const episodeId = this.episodeQueue.dequeue();
        if (episodeId) {
          await this.processEpisode(episodeId);
        }
      }
      // Delay to prevent CPU overuse
      await new Promise(resolve => setTimeout(resolve, 60000)); // 1 minute
    }
  }

  private async initializeQueues() {
    const movies = await this.repository.movie.list();
    const episodes = await this.repository.episode.list();
    movies.forEach(movie => this.movieQueue.enqueue(movie.id));
    episodes.forEach(episode => this.episodeQueue.enqueue(episode.id));
  }

  private async processMovie(id: number) {
    const movie = await findMovieByIdWithPath(this.repository, id);
    if (!movie) {
      return;
    }
    const subtitleFolderPath = path.join(movie.library.path, movie.directory, 'subtitles');
    if (await this.subtitleLockFileExists(subtitleFolderPath)) {
      // Already processed
      return;
    }

    const moviePath = path.join(movie.library.path, movie.directory, movie.file);
    await fs.promises.mkdir(subtitleFolderPath, { recursive: true });
    Log.info(`Extracting subtitles from ${movie.name}`);
    const count = await this.extractSubtitles(moviePath, subtitleFolderPath);
    Log.info(`Extracted ${count} subtitles from ${movie.name}`);
    await this.writeSubtitleLockFile(subtitleFolderPath);
  }

  private async processEpisode(id: number) {
  }

  private async extractSubtitles(videoPath: string, subtitleFolderPath: string) {
    const metadata = await getVideoMetadata(videoPath);
    if (!metadata) {
      Log.debug(`No metadata found for video ${videoPath}`);
      return 0;
    }
    const subtitleStreams = await getSubtitleStreamsFromMetadata(metadata);
    if (!subtitleStreams.length) {
      Log.debug(`No subtitle streams found for video ${videoPath}`);
      return 0;
    }

    for (const stream of subtitleStreams) {
      const subtitlePath = path.join(subtitleFolderPath, `${stream.tags.language}-${stream.index}.srt`);
      try {
        await Transcoding.extractSubtitle(videoPath, stream.index, subtitlePath)
      } catch (err) {
        Log.error(err);
        Log.error(`Failed to extract subtitle from video ${videoPath}`);
      }
    }
    return subtitleStreams.length;
  }

  private onMovieAdded(id: number) {
    this.movieQueue.enqueue(id);
  }

  private onEpisodeAdded(id: number) {
    this.episodeQueue.enqueue(id);
  }

  private writeSubtitleLockFile(dir: string): Promise<void> {
    const lockFile = path.join(dir, '.subtitles.lock');
    return fs.promises.writeFile(lockFile, '');
  }

  private subtitleLockFileExists(dir: string): Promise<boolean> {
    const lockFile = path.join(dir, '.subtitles.lock');
    return fs.promises.access(lockFile, fs.constants.F_OK).then(() => true).catch(() => false);
  }
}
