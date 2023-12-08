import { User } from "../../models/User";
import { Repo } from "./Repo";

export class UserRepo extends Repo {
  async findById(id: number): Promise<User | null> {
    const row = await this.db.oneOrNone('SELECT * FROM users WHERE id = $1', id);
    return row !== null ? User.CreateFromRow(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
    return row !== null ? User.CreateFromRow(row) : null;
  }
}