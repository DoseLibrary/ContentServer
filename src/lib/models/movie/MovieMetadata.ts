
export class MovieMetadata {
  constructor(
    public id: number,
    public title: string,
    public overview: string,
    public releaseDate: string,
    // public runtime: number, // TODO: Should be in movie????
    // public addedDate: number, TODO: Should be in movie????
    public popularity: number, // Can maybe be null?
    public tmdbId: number,
    public backdrop: string,
    public poster: string,
    // public logo: string
  ) { }

  public static CreateFromRow(row: any) {
    // TODO: this sucks
    if (
      !row.id || !row.title || !row.overview || !row.release_date || !row.runtime ||
      !row.popularity || !row.tmdb_id || !row.releaseDate || !row.tmdbId
    ) {
      throw new Error(`Invalid MovieMetadata row: ${JSON.stringify(row)}`);
    }
    return new MovieMetadata(
      row.id,
      row.title,
      row.overview,
      row.release_date,
      row.popularity,
      row.tmdb_id,
      row.backdrop,
      row.poster,
      // row.logo
    );
  }

  public static ValidateAndCreate(
    id?: number,
    title?: string,
    overview?: string,
    releaseDate?: string,
    popularity?: number,
    tmdbId?: number,
    backdrop?: string,
    poster?: string
    ) {
      if (!id || !title || !overview || !releaseDate || !popularity || !tmdbId || !backdrop || !poster) {
        throw new Error(`Invalid metadat for id ${id}`);
      }
      return new MovieMetadata(id, title, overview, releaseDate, popularity, tmdbId, backdrop, poster);
    }
}