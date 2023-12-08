import { IDatabase, IMain } from "pg-promise";
import { Category } from "../../models/Category";

export class CategoryRepo {
  private db: IDatabase<any>;
  private pgp: IMain;

  constructor(db: IDatabase<any>, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }

  async list(): Promise<Category[]> {
    return this.db.any('SELECT * FROM category')
      .then(rows => rows.map(Category.CreateFromRow));
  }
}