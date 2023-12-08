import { Client } from "./Client";

export class ExplorerClient extends Client {
    constructor(version: number) {
        const videoCodecs = [];
        const audioCodecs = [];

        // Video codecs
        if (version >= 9) {
            videoCodecs.push("avc");
            videoCodecs.push("h264");
        }
        if (version >= 11) {
            videoCodecs.push("hevc");
            videoCodecs.push("h265");
            videoCodecs.push("vp8");
        }

        // Audio codecs
        if (version >= 9) {
            audioCodecs.push("aac");
            audioCodecs.push("mp3");
        }

        super('Internet Explorer', version, videoCodecs, audioCodecs);
    }
}