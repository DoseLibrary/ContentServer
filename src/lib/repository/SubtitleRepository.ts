import { Repository } from "./Repository";

export class SubtitleRepository extends Repository {
  public async findByPath(path: string) {
    return this.prisma.subtitle.findFirst({
      where: {
        path
      }
    });
  }

  public async findById(id: number) {
    return this.prisma.subtitle.findFirst({
      where: {
        id
      }
    });
  }
}