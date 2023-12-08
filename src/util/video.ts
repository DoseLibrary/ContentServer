import EventEmitter from 'events';
import ffmpeg, { FfprobeData, FfprobeStream } from 'fluent-ffmpeg';
import { Log } from '../lib/Logger';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createDir } from './file';
import { Resolution } from '../types/AvailableResolutions';

export const getAudioStreamsFromMetadata = (metadata: FfprobeData): FfprobeStream[] => {
  return metadata.streams.filter(stream => stream.codec_type === 'audio');
}

export const getVideoStreamsFromMetadata = (metadata: FfprobeData): FfprobeStream[] => {
  return metadata.streams.filter(stream => stream.codec_type === 'video');
}

export const getSubtitleStreamsFromMetadata = (
  metadata: FfprobeData,
  languages: string[] = ['eng', 'swe']
): FfprobeStream[] => {
  return metadata.streams.filter(stream =>
    stream.codec_type === 'subtitle' &&
    stream.codec_name == 'subrip' &&
    stream.tags != undefined &&
    languages.includes(stream.tags.language)
  );
}

export const getVideoMetadata = (videoPath: string): Promise<FfprobeData | undefined> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        resolve(undefined);
      }
      resolve(metadata);
    });
  });
}

export const getDurationFromVideoMetadata = (metadata: FfprobeData): number | undefined => {
  return metadata.format.duration;
}

export const getVideoResolutionsFromStreams = (metadata: FfprobeData): Resolution[] => {
  const pushIfAbove = (value: number, min: number, arr: string[], valueToPush: string) => {
    if (value >= min) {
      arr.push(valueToPush);
    }
  }

  const [stream] = getVideoStreamsFromMetadata(metadata);
  if (stream === undefined) { return [] };
  const width = stream.width;
  if (width === undefined) { return [] };
  const resolutions: Resolution[] = [];
  pushIfAbove(width, 426, resolutions, '240p');
  pushIfAbove(width, 480, resolutions, '360p');
  pushIfAbove(width, 1280, resolutions, '720p');
  pushIfAbove(width, 1920, resolutions, '1080p');
  pushIfAbove(width, 2560, resolutions, '1440p');
  pushIfAbove(width, 3840, resolutions, '4k');
  pushIfAbove(width, 7680, resolutions, '8k');
  return resolutions;
}

export const getVideoCodecFromStreams = (metadata: FfprobeData): string => {
  const [stream] = getVideoStreamsFromMetadata(metadata);
  return stream.codec_name || 'unknown';
}

export const getAudioCodecsFromStreams = (metadata: FfprobeData): string[] => {
  const streams = getAudioStreamsFromMetadata(metadata);
  return streams.map(stream => stream.codec_name!).filter(codec => codec !== undefined);
}