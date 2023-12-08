import { Client } from "./Client";

export class IphoneClient extends Client {
  constructor(version: number) {
    const videoCodecs = ["h264", "ogg"];
    const audioCodecs = ["aac", "mp3"];

    super('iPhone', version, videoCodecs, audioCodecs);
  }
}