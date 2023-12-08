import { LibraryType } from "@prisma/client";
import { RepositoryManager } from "../repository";
import { Job } from "./Job";
import fs from 'fs';
import path from 'path';
import { Log } from "../Logger";

export class ScanForTrailerJob extends Job {
  private repository: RepositoryManager;

  constructor(repository: RepositoryManager) {
    super({
      useInterval: true,
      intervalMs: 43200000, // Every 12 hour
      runAtStart: true
    })
    this.repository = repository;
  }

  protected async execute(): Promise<void> {
    const libraries = await this.repository.library.listByType(LibraryType.MOVIE);
    libraries.forEach(library => this.scanLibrary(library.path, library.id));
  }

  private async scanLibrary(dir: string, libraryId: number) {
    const files = await this.readDir(dir);
    const trailers = files.filter(file => path.parse(file.name).name === 'trailer');
    for (const trailer of trailers) {
      const relativePath = path.relative(dir, trailer.path);
      // TODO: Only select movies that don't have a trailer
      const movie = await this.repository.movie.findByDirectoryInLibrary(relativePath, libraryId);
      if (movie) {
        const fullPath = path.join(trailer.path, trailer.name);
        Log.info(`Found trailer for movie ${movie.name}`);
        await this.repository.movie.updateTrailer(movie.id, fullPath);
      }
    }
  }

  private readDir(dir: string) {
    return fs.promises.readdir(dir, {
      withFileTypes: true,
      recursive: true
    }).then(files => files.filter(file => file.isFile()));
  }
}