import { EventEmitter } from "events";
import { Library } from "./library/Library";
import { createLibraryFromModel } from "./library";
import * as chokidar from 'chokidar';
import { Log } from "./Logger";
import path from 'path';
import UnsuportedFormatException from "../exceptions/UnsupportedFormat";
import { RepositoryManager } from "./repository";
import ParseException from "../exceptions/ParseException";

export class Watcher {
  private libraries: Library[] = [];
  private repository: RepositoryManager;
  private chokidarOptions: chokidar.WatchOptions;

  constructor(repository: RepositoryManager, libraries: Library[] = []) {
    this.repository = repository;
    this.libraries = libraries;
    this.chokidarOptions = {
      ignored: this.getIgnoredFileRegex(),
      awaitWriteFinish: true,
      ignoreInitial: false
    }
  }

  public async start(emitter: EventEmitter) {
    Log.debug('Starting watcher');
    await this.setLibraries(emitter);
    this.libraries.forEach(library => this.watch(library));
  }

  private getRelativePath(filePath: string, folderPath: string) {
    return path.relative(folderPath, filePath);
  }

  private onNewFile(path: string, library: Library) {
    const relativePath = this.getRelativePath(path, library.path);
    library.handleNewEntry(relativePath)
      .catch((error: Error) => {
        if (error instanceof UnsuportedFormatException) {
          Log.warning(`${path} is not a supported format`);
        } else if (error instanceof ParseException) {
          Log.warning(error.message);
        } else {
          Log.error(`Unknown error ${error.stack || error}`);
        }
      })
  }

  private onRemovedFile(path: string, library: Library) {
    const relativePath = this.getRelativePath(path, library.path);
    library.handleRemovedEntry(relativePath)
      .catch((error: Error) => {
        Log.error(`Unknown error when removing entry ${error.stack || error}`);
      });
  }

  private watch(library: Library) {
    const proc = chokidar.watch(library.path, this.chokidarOptions);
    proc.on('add', path => this.onNewFile(path, library));
    proc.on('unlink', path => this.onRemovedFile(path, library));
    proc.on('error', error => {
      Log.error(`File system watcher error`);
      Log.error(error);
    });
    proc.on('ready', () => Log.debug(`Watching ${library.path} for changes`));
  }

  private async setLibraries(emitter: EventEmitter) {
    const libraries = await this.repository.library.list();
    this.libraries = libraries.map(lib => createLibraryFromModel(lib, this.repository, emitter));
  }

  private getIgnoredFileRegex() {
    const ignoredTypes = ['.m3u8', '.jpg', '.png', '.lock'];
    return new RegExp(
      ignoredTypes.map(type => `(.*\\${type})`).join('|'),
      'g'
    );
  }
}