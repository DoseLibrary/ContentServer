import { sql } from "../../../sql";
import { MovieMetadata } from "../../models/movie/MovieMetadata";
import { Repo } from "./Repo";

export class MovieMetadataRepo extends Repo {
  list() {
    return this.db.any(sql.movieMetadata.list).then(rows => rows.map(MovieMetadata.CreateFromRow));
  }

  search(query: string) {
    return this.db.any(sql.movieMetadata.search, { query: `%${query}%` })
      .then(rows => rows.map(MovieMetadata.CreateFromRow));
  }

  listByIds(ids: number[]) {
    return this.db.any(sql.movieMetadata.listByIds, { ids })
      .then(rows => rows.map(MovieMetadata.CreateFromRow));
  }
}
