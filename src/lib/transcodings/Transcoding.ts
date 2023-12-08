import { FfmpegProgressEvent, TranscodingPreset, TranscodingSettings, TranscodingStartOptions, TranscodingVideoCodec } from "../../types/TranscodingTypes";
import fs from 'fs';
import path from 'path';
import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { Log } from "../Logger";
import { Resolution } from "../../types/AvailableResolutions";
import { v4 as uuidv4 } from 'uuid';
import { Writable } from 'stream';

// ❤️ Nooba sig med nooben = svettig grek
export default class Transcoding {
  public static SEGMENT_DURATION = 4;
  private static FAST_START_TIME = Transcoding.SEGMENT_DURATION * 50;
  private _output: string;
  private _startOptions?: TranscodingStartOptions;
  private _latestSegment: number;
  private crf: number;
  private threads: number;
  private preset: TranscodingPreset;
  private ffmpegProc: FfmpegCommand;
  private videoCodec: TranscodingVideoCodec;
  private finished: boolean = false;

  constructor(
    settings: TranscodingSettings,
    videoCodec: TranscodingVideoCodec
  ) {
    this.crf = settings.crf;
    this.threads = settings.threads;
    this.preset = settings.preset;
    this.videoCodec = videoCodec;

    this.onTranscodingStart = this.onTranscodingStart.bind(this);
    this.onTranscodingError = this.onTranscodingError.bind(this);
    this.onTranscodingProgress = this.onTranscodingProgress.bind(this);
    this.onTranscodingFinished = this.onTranscodingFinished.bind(this);
  }

  public static async extractSubtitle(videoPath: string, streamIndex: number, output: string) {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noAudio()
        .noVideo()
        .inputOption('-threads 3')
        .outputOptions([
          `-map 0:${streamIndex}`,
          '-c copy'
        ])
        .output(output)
        .on('start', (cmd) => Log.debug(`Extract subtitle command: ${cmd}`))
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  public static async transcodeSubtitle(subtitlePath: string, outputPath: string): Promise<string> {
    const dir = await Transcoding.createTempDirecory(outputPath);
    const output = path.join(dir, 'subtitle-%d.vtt');
    const outputOptions = [
      '-f segment',
      '-segment_time 14400', // Hard coded to 4 hours, should be enough for any subtitle
      '-segment_format webvtt',
      '-scodec webvtt',
      '-muxdelay 0'
    ];

    return new Promise((resolve, reject) => {
      ffmpeg(subtitlePath)
        .outputOptions(outputOptions)
        .on('end', () => resolve(path.join(dir, 'subtitle-0.vtt'))) // Will always be 0 because of segment_time
        .on('error', (err) => {
          fs.promises.rm(dir, { recursive: true, force: true });
          if (err.message != 'Output stream closed' && err.message != 'ffmpeg was killed with signal SIGKILL') {
            Log.error(`[HLS] Error transcoding subtitle: ${err.message}`);
            reject(err);
          }
        })
        .output(output)
        .run();
    })
  }

  public get resolution(): Resolution {
    if (!this._startOptions) {
      throw new Error('Transcoding was never started');
    }
    return this._startOptions.resolution;
  }
  public get latestSegment(): number {
    return this._latestSegment;
  }
  public get output(): string {
    return this._output;
  }
  public get startSegment(): number {
    if (!this._startOptions) {
      throw new Error('Transcoding was never started');
    }
    return this._startOptions.segment;
  }

  public isActive(): boolean {
    return this.ffmpegProc !== undefined && !this.finished;
  }

  public async start(options: TranscodingStartOptions) {
    this._startOptions = options;
    this._output = await Transcoding.createTempDirecory(options.output);

    const seekTime = options.segment * Transcoding.SEGMENT_DURATION;
    const outputOptions = this.getOutputOptions(this.crf, this.preset, options.segment);
    const inputOptions = this.getInputOptions(this.threads, seekTime);

    return new Promise(resolve => {
      this.ffmpegProc = ffmpeg(options.filePath)
        .withVideoCodec(this.getVideoCodec())
        .withAudioCodec('aac')
        .inputOptions(inputOptions)
        .outputOptions(outputOptions)
        .addOutputOption(this.getResolutionParameter(options.resolution))
        .addOutputOption(`-start_number ${options.segment}`)
        .output(this._output)
        .on('start', (cmd) => this.onTranscodingStart(cmd, resolve))
        .on('progress', this.onTranscodingProgress)
        .on('end', this.onTranscodingFinished)
        .on('error', this.onTranscodingError);
      this.ffmpegProc.run();
    });

  }

  public async restart(segment: number, resolution: Resolution) {
    if (!this._startOptions) {
      throw new Error('Transcoding was never started');
    }
    const options = this._startOptions;
    options.segment = segment;
    options.resolution = resolution;
    this.stop();
    return this.start(options);
  }

  public stop() {
    this.ffmpegProc.kill('SIGKILL');
    this.deleteTempFolder();
  }

  private addSeektimeToSeconds(seconds: number) {
    return seconds + this.startSegment * Transcoding.SEGMENT_DURATION;
  }

  private onTranscodingStart(cmd: string, cb: Function) {
    Log.debug(`[HLS] Spawned ffmpeg (codec: ${this.videoCodec}) with command ${cmd}`);
    cb();
  }

  private onTranscodingProgress(progress: FfmpegProgressEvent) {
    const seconds = this.addSeektimeToSeconds(this.timestampToSeconds(progress.timemark));
    // Sometimes ffmpeg reports timemark as negative if using nvenc
    if (seconds > 0) {
      this._latestSegment = Math.max(Math.floor(seconds / Transcoding.SEGMENT_DURATION) - 1); // - 1 because the first segment is 0
    }
  }

  private onTranscodingFinished() {
    this.finished = true;
  }

  private timestampToSeconds(timestamp: string) {
    const time = timestamp.split(':');
    return parseInt(time[0]) * 60 * 60 + parseInt(time[1]) * 60 + parseInt(time[2]);
  }

  private onTranscodingError(err: Error, stdout: string, stderr: string) {
    if (err.message !== 'Output stream closed' && err.message !== 'ffmpeg was killed with signal SIGKILL') {
      Log.error(`Cannot process video: ${err.message}`);
      Log.error(stderr);
    }
  }

  private getVideoCodec(): string {
    switch (this.videoCodec) {
      case TranscodingVideoCodec.H264:
        return 'libx264';
      case TranscodingVideoCodec.H265:
        return 'libx265';
      case TranscodingVideoCodec.H264_NVENC:
        return 'h264_nvenc';
    }
  }

  private getInputOptions(threads: number, seekTime: number) {
    const options = [
      '-y',
      '-loglevel verbose',
      '-copyts', // Fixes timestamp issues (Keep timestamps as original file)
      `-readrate_initial_burst ${Transcoding.FAST_START_TIME}`, // Do I need -re aswell?
      `-ss ${seekTime}`
    ];
    if (this.videoCodec === TranscodingVideoCodec.H264_NVENC) {
      options.push('-hwaccel nvdec');
    } else {
      options.push(`-threads ${threads}`);
    }
    return options;
  }

  private getOutputOptions(crf: number, preset: TranscodingPreset, startSegment: number) {
    //'-level 4.1' was used before, but makes GPU transcoding fail sometimes
    const options = [
      '-copyts', // Fixes timestamp issues (Keep timestamps as original file)
      '-map 0',
      '-map -v',
      '-map 0:V',
      '-g 52',
      `-crf ${crf}`,
      '-sn',
      '-f hls',
      `-hls_time ${Transcoding.SEGMENT_DURATION}`,
      '-force_key_frames expr:gte(t,n_forced*2)',
      '-hls_playlist_type vod',
      '-strict 1', // Force to use specification when decoding audio/video
      '-ac 2', // Set two audio channels. Fixes audio issues
      '-b:a 320k',
      '-muxdelay 0',
    ];
    if (startSegment !== undefined) {
      options.push(`-start_number ${startSegment}`);
    }
    if (this.videoCodec !== TranscodingVideoCodec.H264_NVENC) {
      options.push('-deadline realtime');
      options.push(`-preset:v ${preset}`);
    }
    return options;
  }

  private getResolutionParameter(resolution: Resolution) {
    switch (this.videoCodec) {
      case TranscodingVideoCodec.H264:
      case TranscodingVideoCodec.H265:
        return this.getCpuResolutionParameter(resolution);
      case TranscodingVideoCodec.H264_NVENC:
        return this.getGpuResolutionParameter(resolution);
    }
  }

  private getCpuResolutionParameter(resolution: Resolution) {
    switch (resolution) {
      case '240p':
        return ['-vf scale=320:-2', '-b:v 1M'];
      case '360p':
        return ['-vf scale=480:-2', '-b:v 1500k'];
      case '480p':
        return ['-vf scale=854:-2', '-b:v 4M'];
      case '720p':
        return ['-vf scale=1280:-2', '-b:v 7500k'];
      case '1080p':
        return ['-vf scale=1920:-2', '-b:v 12M'];
      case '1440p':
        return ['-vf scale=2560:-2', '-b:v 24M'];
      case '4k':
        return ['-vf scale=3840:-2', '-b:v 60M'];
      case '8k':
        return ['-vf scale=7680:-2', '-b:v 120M'];
    }
  }

  private getGpuResolutionParameter(resolution: Resolution) {
    switch (resolution) {
      case '240p':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=352:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 1M'];
      case '360p':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=480:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 1500k'];
      case '480p':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=854:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 4M'];
      case '720p':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=1280:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 7500k'];
      case '1080p':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=1920:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 12M'];
      case '1440p':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=2560:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 24M'];
      case '4k':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=3860:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 60M'];
      case '8k':
        return ['-filter_complex [0:v]hwdownload,scale_npp=w=8192:h=-2,format=nv12,format=yuv420p[0:v]', '-b:v 120M'];
    }
  }

  private static async createTempDirecory(basePath: string): Promise<string> {
    const fullPath = path.join(basePath, `transcoding-${uuidv4()}`);
    await fs.promises.mkdir(fullPath, { recursive: true });
    return fullPath + path.sep;
  }

  private deleteTempFolder() {
    return fs.promises.rm(this._output, { recursive: true, force: true })
      .catch(err => Log.error(`[HLS] Couldn't remove temp directory ${err}`));
  }
}
