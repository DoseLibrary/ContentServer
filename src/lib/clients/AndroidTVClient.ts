import { Client } from "./Client";

export class AndroidTVClient extends Client {
  constructor(version: number) {
    const videoCodecs = ["h263", "h264", "avc", "mpeg", "mpeg-4", "mpeg-4 sp", "hevc"];
    const audioCodecs = ["aac", "amr", "mp3", "midi", "pcm", "wave", "vorbis"];
    // Video codecs
    if (version >= 2.3) {
      videoCodecs.push("vp8");
    }
    if (version >= 4.4) {
      videoCodecs.push("vp9");
    }
    if (version >= 5) {
      videoCodecs.push("h265");
    }
    if (version >= 10) {
      videoCodecs.push("av1");
    }

    // Audio codecs
    if (version >= 3.1) {
      audioCodecs.push("flac");
    }
    if (version >= 5) {
      audioCodecs.push("opus");
    }
    if (version >= 9) {
      audioCodecs.push("xhe-aac");
    }

    super('Android TV', version, videoCodecs, audioCodecs);
  }
}