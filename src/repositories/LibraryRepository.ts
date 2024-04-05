import { AppDataSource } from "../DataSource";
import fs from 'fs';
import { Log } from "../lib/Logger";
import { Library } from "../models/Library";

export const LibraryRepository = AppDataSource.getRepository(Library).extend({
  async sync() {
    const libraries = await this.find();
    const missing = libraries.filter(library => !fs.existsSync(library.path));
    await Promise.all(missing.map(library => this.remove(library)));
    missing.forEach(library => Log.info(`Library ${library.name} was removed from the database`));
  }
})
