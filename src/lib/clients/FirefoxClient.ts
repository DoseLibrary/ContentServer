import { Client } from "./Client";

export class FirefoxClient extends Client {
  constructor(version: number) {
    const videoCodecs = [];
    const audioCodecs = ["aac", "mp3"];

    if (version >= 3) {
      videoCodecs.push("theora");
      videoCodecs.push("ogg");
    }
    if (version >= 4) {
      videoCodecs.push("vp8");
    }
    if (version >= 28) {
      videoCodecs.push("vp9");
    }
    if (version >= 35) {
      videoCodecs.push("avc");
      videoCodecs.push("h264");
    }
    if (version >= 67) {
      videoCodecs.push("av1");
    }

    // Audio codecs
    if (version >= 3) {
      audioCodecs.push("vorbis");
    }
    if (version >= 15) {
      audioCodecs.push("opus");
    }
    if (version >= 51) {
      audioCodecs.push("flac");
    }

    super('Firefox', version, videoCodecs, audioCodecs);
  }
}