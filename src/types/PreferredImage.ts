import { ImageType } from "../models/Image";

export type PreferredImage = {
  data: string;
  preferred: boolean;
  type: ImageType;
  externalId?: number;
}