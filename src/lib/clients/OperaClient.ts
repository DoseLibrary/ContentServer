import { Client } from "./Client";

export class OperaClient extends Client {
  constructor(version: number) {
    const videoCodecs = [];
    const audioCodecs = ["aac", "mp3"];

    // Video codecs
    if (version >= 10) {
      videoCodecs.push("theora");
      videoCodecs.push("vp9");
    }
    if (version >= 16) {
      videoCodecs.push("vp8");
    }
    if (version >= 25) {
      videoCodecs.push("avc");
      videoCodecs.push("h264");
    }
    if (version >= 57) {
      videoCodecs.push("av1");
    }

    // Audio codecs
    if (version >= 11) {
      audioCodecs.push("vorbis");
    }
    if (version >= 20) {
      audioCodecs.push("opus");
    }

    super('opera', version, videoCodecs, audioCodecs);
  }
}