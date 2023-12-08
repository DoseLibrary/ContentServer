import { LibraryType } from "@prisma/client";
import { Repository } from "./Repository";

export class LibraryRepository extends Repository {
  public listByType(type: LibraryType) {
    return this.prisma.library.findMany({
      where: {
        type
      }
    });
  }

  public list() {
    return this.prisma.library.findMany();
  }
}