import { Repo } from "./Repo";
import { SerieMetadata } from "../../models/show/SerieMetadata";
import { sql } from "../../../sql";

export class SerieMetadataRepo extends Repo {
  list() {
    return this.db.any(sql.serieMetadata.list).then(rows => rows.map(SerieMetadata.CreateFromRow));
  }

  search(query: string) {
    return this.db.any(sql.serieMetadata.search, { query: `%${query}%` })
      .then(rows => rows.map(SerieMetadata.CreateFromRow));
  }
}