import path from 'path';
import { QueryFile } from 'pg-promise';

/**
 * Paths can be deceiving..
 * Currently webpack is setup to copy this sql folder as is to the dist folder.
 * That means that the path that this function accepts have to be an absolute path
 * from the dist folder, i.e "./sql/<folder>/<file>.sql"
 */
const createQueryFile = (file: string) =>
  new QueryFile(path.join(__dirname, file), { minify: true });

const movieMetadata = {
  list: createQueryFile('./sql/MovieMetadata/list.sql'),
  listByIds: createQueryFile('./sql/MovieMetadata/listByIds.sql'),
  search: createQueryFile('./sql/MovieMetadata/search.sql')
}

const serieMetadata = {
  list: createQueryFile('./sql/SerieMetadata/list.sql'),
  search: createQueryFile('./sql/SerieMetadata/search.sql')
}

const movie = {
  getById: {
    metadataGenreActor: createQueryFile('./sql/Movie/get/metadataGenreActor.sql')
  }
}

export const sql = {
  movieMetadata,
  serieMetadata,
  movie
}