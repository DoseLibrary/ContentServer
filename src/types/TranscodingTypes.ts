import { Resolution } from "./AvailableResolutions";

export enum TranscodingVideoCodec {
  H264 = 'h264',
  H264_NVENC = 'h264_nvenc',
  H265 = 'h265'
};

export enum TranscodingPreset {
  ULTRAFAST = 'ultrafast',
  SUPERFAST = 'superfast',
  VERYFAST = 'veryfast',
  FASTER = 'faster',
  FAST = 'fast',
  MEDIUM = 'medium',
  SLOW = 'slow',
  SLOWER = 'slower',
  VERYSLOW = 'veryslow'
}

export interface TranscodingStartOptions {
  filePath: string;
  resolution: Resolution;
  audioStream: number;
  output: string;
  segment: number;
}

export interface TranscodingSettings {
  crf: number;
  preset: TranscodingPreset;
  threads: number;
}

export interface FfmpegProgressEvent {
  frames: number;
  currentFps: number;
  currentKbps: number;
  targetSize: number;
  timemark: string;
  percent: number;
}