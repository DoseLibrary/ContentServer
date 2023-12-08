export class User {
  constructor(public id: number, public username: string, public has_access: boolean) { }

  public static CreateFromRow(row: any) {
    if (!row || !row.id || !row.username || !row.has_access) {
      throw new Error(`Invalid user row: ${row}`);
    }
    return new User(row.id, row.username, row.has_access);
  }
}