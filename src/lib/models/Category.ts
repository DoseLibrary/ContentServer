export class Category {
  constructor(public imdb_category_id: number, public name: string) { }

  public static CreateFromRow(row: any) {
    if (!row || !row.imdb_category_id || !row.name) {
      throw new Error(`Invalid category row: ${row}`);
    }
    return new Category(row.imdb_category_id, row.name);
  }
}