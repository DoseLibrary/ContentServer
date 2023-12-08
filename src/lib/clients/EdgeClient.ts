import { Client } from "./Client";

export class EdgeClient extends Client {
  constructor(version: number) {
    const videoCodecs = ["theora", "ogg"];
    const audioCodecs = ["aac", "flac", "mp3"];

    // Video codecs
    if (version >= 12) {
      videoCodecs.push("avc");
      videoCodecs.push("h264");
    }
    if (version >= 14) {
      videoCodecs.push("vp8");
      videoCodecs.push("vp9");
    }
    if (version >= 18) {
      videoCodecs.push("hevc");
      videoCodecs.push("h265");
    }
    if (version >= 75) {
      videoCodecs.push("av1");
    }

    // Audio codecs
    if (version >= 14) {
      audioCodecs.push("opus");
    }
    if (version >= 17) {
      audioCodecs.push("vorbis");
    }

    super("Edge", version, videoCodecs, audioCodecs);
  }
}