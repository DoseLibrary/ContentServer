import { Repository } from "./Repository";

export class GenreRepository extends Repository {
  public list() {
    return this.prisma.genre.findMany();
  }
}
