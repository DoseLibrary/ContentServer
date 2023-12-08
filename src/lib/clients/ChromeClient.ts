import { Client } from "./Client";

export class ChromeClient extends Client {
  constructor(version: number) {
    const videoCodecs = [];
    const audioCodecs = ["aac", "flac", "mp3"];

    // Video codecs
    if (version >= 3) {
      videoCodecs.push("theora");
    }
    if (version >= 4) {
      videoCodecs.push("h264");
      videoCodecs.push("avc");
      videoCodecs.push("ogg");
    }
    if (version >= 25) {
      videoCodecs.push("vp8");
    }
    if (version >= 29) {
      videoCodecs.push("vp9");
    }
    if (version >= 70) {
      videoCodecs.push("av1");
    }
    if (version >= 107) {
      videoCodecs.push("hevc");
    }

    // Audio codecs
    if (version >= 4) {
      audioCodecs.push("vorbis");
    }
    if (version >= 33) {
      audioCodecs.push("opus");
    }

    super('chrome', version, videoCodecs, audioCodecs);
  }
}