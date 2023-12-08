import { ImageType } from "@prisma/client";

export type PreferredImage = {
  path: string;
  preferred: boolean;
  type: ImageType;
  externalId?: number;
}