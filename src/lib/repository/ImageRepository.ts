import { Repository } from "./Repository";

export class ImageRepository extends Repository {
  public findById(id: number) {
    return this.prisma.image.findFirst({
      where: {
        id
      }
    });
  }
}