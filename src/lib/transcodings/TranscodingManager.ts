import { Resolution } from "../../types/AvailableResolutions";
import { TranscodingStartOptions, TranscodingVideoCodec } from "../../types/TranscodingTypes";
import { Config } from "../Config";
import { Log } from "../Logger";
import Transcoding from "./Transcoding";

interface TranscodingInfo {
  transcoding: Transcoding;
  lastRequestedTime: Date;
}

class TranscodingManager {
  private transcodings: Map<string, TranscodingInfo>;
  private config: Config;
  private interval: NodeJS.Timeout;

  constructor() {
    this.transcodings = new Map();
    this.interval = setInterval(this.stopOldTranscodings.bind(this), 1000);
  }

  public transcodeSubtitle(subtitlePath: string) {
    return Transcoding.transcodeSubtitle(subtitlePath, this.config.transcoding.directory);
  }

  public setConfig(config: Config) {
    this.config = config;
  }

  public get(transcodingId: string) {
    return this.transcodings.get(transcodingId)?.transcoding;
  }

  public async create(
    id: string,
    filePath: string,
    resolution: Resolution,
    audioStream: number,
    codec: TranscodingVideoCodec
  ) {
    const transcoding = new Transcoding(this.getTranscodingSettings(codec), codec);
    this.transcodings.set(id, { transcoding, lastRequestedTime: new Date() });
    const options: TranscodingStartOptions = {
      audioStream,
      filePath,
      output: this.config.transcoding.directory,
      resolution,
      segment: 0
    };
    await transcoding.start(options);
    return transcoding;
  }

  public remove(transcodingId: string) {
    const { transcoding } = this.transcodings.get(transcodingId) || {};
    if (transcoding) {
      transcoding.stop();
      this.transcodings.delete(transcodingId);
    }
    return transcoding !== undefined;
  }

  public setLastRequestedTime(transcodingId: string) {
    const transcodingInfo = this.transcodings.get(transcodingId);
    if (!transcodingInfo) {
      throw new Error(`Transcoding with id ${transcodingId} not found`);
    }
    transcodingInfo.lastRequestedTime = new Date();
  }

  private getTranscodingSettings(codec: TranscodingVideoCodec) {
    switch (codec) {
      case TranscodingVideoCodec.H264:
        return this.config.transcoding.h264;
      case TranscodingVideoCodec.H265:
        return this.config.transcoding.h265;
      case TranscodingVideoCodec.H264_NVENC:
        return this.config.transcoding.h264_nvenc;
    }
  }

  private stopOldTranscodings() {
    const timeout = 20 * 1000; // 20 seconds
    const now = new Date();

    for (const [id, info] of this.transcodings.entries()) {
      const { lastRequestedTime } = info;
      if (now.getTime() - lastRequestedTime.getTime() > timeout) {
        Log.debug(`[HLS] Stopping transcoding ${id} because it was inactive for too long`);
        this.remove(id);
      }
    }
  }
}

// The one and only transcoding manager
const transcodingManager = new TranscodingManager();
export default transcodingManager;