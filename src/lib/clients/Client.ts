import { Log } from "../Logger";

export abstract class Client {
  private name: string;
  private version: number;
  private videoCodecs: string[];
  private audioCodecs: string[];

  constructor(name: string, version: number, videoCodecs: string[], audioCodecs: string[]) {
    this.name = name;
    this.version = version;
    this.videoCodecs = videoCodecs;
    this.audioCodecs = audioCodecs;
  }

  public isVideoCodecSupported(codec: string) {
    const supported = this.videoCodecs.includes(codec);
    Log.debug(`Video codec ${codec} for client ${this.name} V${this.version} gave supported: ${supported}`);
    return supported;
  }

  public isAudioCodecSupported(codec: string) {
    const supported = this.audioCodecs.includes(codec);
    Log.debug(`Audio codec ${codec} for client ${this.name} V${this.version} gave supported: ${supported}`);
    return supported;
  }
}
