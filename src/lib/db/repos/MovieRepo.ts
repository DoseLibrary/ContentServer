import { sql } from "../../../sql";
import { Actor } from "../../models/Actor";
import { Category } from "../../models/Category";
import { Character } from "../../models/Character";
import { Movie } from "../../models/movie/Movie";
import { MovieMetadata } from "../../models/movie/MovieMetadata";
import { Repo } from "./Repo";

interface MovieRecommendedDb {
  movie_id_1: number;
  movie_id_2: number;
  priority: number;
}


export class MovieRepo extends Repo {
  get(id: number) {
    return this.db.one(sql.movie.getById.metadataGenreActor, { id })
      .then(row => {
        // TODO: support movies without metadata
        const metadata = MovieMetadata.ValidateAndCreate(
          row.metadata_id,
          row.title,
          row.overview,
          row.release_date,
          row.popularity,
          row.tmdb_id,
          row.backdrop,
          row.poster
        );
        const genres = row.genres.map(Category.CreateFromRow);
        const characters = row.characters.map((characterRow: any) => {
          const actor = new Actor(characterRow.actor_id, characterRow.actor_name, characterRow.actor_image);
          return new Character(characterRow.character_name, characterRow.order, actor);
        });
        return new Movie(row.id, genres, characters, row.trailer, metadata);
      })
  }

  async exists(id: number): Promise<boolean> {
    const data = await this.db.oneOrNone('SELECT id FROM movie WHERE id = $1', id);
    return data !== null;
  }

  // Should this be here, or in metadata? Or in it's own MovieRecommended repo..?
  async getRecommended(id: number) {
    const cleanData = (entry: MovieRecommendedDb) => {
      const entryId = entry.movie_id_1 !== id ? entry.movie_id_1 : entry.movie_id_2;
      return {
        id: entryId,
        priority: entry.priority
      }
    }

    const data = await this.db.any('SELECT * FROM movie_recommended WHERE movie_id_1 = $1 OR movie_id_2 = $1', id);
    return data.map(cleanData);
  }
}