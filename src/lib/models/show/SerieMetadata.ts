export class SerieMetadata {
  constructor(
    public id: number,
    public serieId: number,
    public title: string,
    public overview: string,
    public addedDate: number,
    public tmdbId: number,
    public popularity?: number,
    public firstAirDate?: string // date?
    // TODO: logo, backdrop, poster
  ) { }

  public static CreateFromRow(row: any) {
    if (!row.id || !row.serie_id || !row.title || !row.overview || !row.added_date
      || !row.tmdb_id) {
      throw new Error(`Invalid SerieMetadata row: ${JSON.stringify(row)}`);
    }
    return new SerieMetadata(
      row.id,
      row.serie_id,
      row.title,
      row.overview,
      row.added_date,
      row.tmdb_id,
      row.popularity,
      row.first_air_date
    );
  }
}