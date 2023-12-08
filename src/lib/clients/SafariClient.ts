import { Client } from "./Client";

export class SafariClient extends Client {
  constructor(version: number) {
    const videoCodecs = ["mpeg-1", "mpeg-2"];
    const audioCodecs = ["alac"];

    // Video codecs
    if (version >= 3) {
      videoCodecs.push("avc");
      videoCodecs.push("h264");
    }
    if (version >= 11) {
      videoCodecs.push("hevc");
      videoCodecs.push("h265");
    }

    // Audio codecs
    if (version >= 3) {
      audioCodecs.push("aac");
    }
    if (version >= 11) {
      audioCodecs.push("flac");
    }
    if (version >= 3) {
      audioCodecs.push("mp3");
    }

    super('Safari', version, videoCodecs, audioCodecs);
  }
}