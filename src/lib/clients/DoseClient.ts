import { Client } from "./Client";

export class DoseClient extends Client {
  constructor() {
    const videoCodecs = ["h263", "h264", "h265", "hevc", "avc", "mpeg", "mpeg-4", "mpeg-4 sp"];
    const audioCodecs = ["aac", "amr", "mp3", "midi", "pcm", "wave", "vorbis"];

    super('Dose App', 1, videoCodecs, audioCodecs);
  }
}