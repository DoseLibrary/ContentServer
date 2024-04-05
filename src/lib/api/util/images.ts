import { Image, ImageClient } from "../ImageClient"
import { PreferredImage } from "../../../types/PreferredImage";
import { ImageType } from "../../../models/Image";

export const getPreferredImage = (images: Image[], language: string, highAspectRatio: boolean = false): Image | undefined => {
  const imagesWithCorrectLanguage = images.filter(image => image.language === language);
  if (highAspectRatio) {
    const maxAspectRatio = imagesWithCorrectLanguage.reduce(
      (prev, current) => prev.aspectRatio > current.aspectRatio ? prev : current,
      imagesWithCorrectLanguage[0]
    );
    return maxAspectRatio;
  }
  return imagesWithCorrectLanguage[0];
}

export const downloadPreferredImage = async (
  imageClient: ImageClient,
  images: Image[],
  type: ImageType
): Promise<PreferredImage | undefined> => {
  const preferredImage = getPreferredImage(images, 'en');
  const imageToDownload = preferredImage || images[0] || undefined;
  if (imageToDownload) {
    const buffer = await imageClient.downloadImage(imageToDownload.url);
    return {
      data: buffer.toString('base64'),
      preferred: preferredImage !== undefined,
      type
    };
  }
  return undefined;
}