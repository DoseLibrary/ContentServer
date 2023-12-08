import { IDatabase, IMain } from "pg-promise";

export class Repo {
  constructor(protected db: IDatabase<any>, protected pgp: IMain) { }
}
