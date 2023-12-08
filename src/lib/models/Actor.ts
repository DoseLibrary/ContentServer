export class Actor {
  constructor(public id: number, public name: string, public image: string) { }

  public static CreateFromRow(row: any) {
    if (!row || !row.id || !row.name || !row.image) {
      throw new Error(`Invalid Actor row: ${row}`);
    }
    return new Actor(row.id, row.name, row.image);
  }
}