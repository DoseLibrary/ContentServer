export type Resolution = '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '4k' |'8k';

export interface AvailableResolutions {
  resolutions: Resolution[];
  directplay: boolean;
}