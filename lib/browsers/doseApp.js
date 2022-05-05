const Browser = require('./browser');

class DoseApp extends Browser {
    constructor() {
        let supportedVideoCodecs = ["h263", "h264", "h265", "hevc", "avc", "mpeg", "mpeg-4", "mpeg-4 sp"];
        //let supportedVideoCodecs = [];
        let supportedAudioCodecs = ["aac", "amr", "mp3", "midi", "pcm", "wave", "vorbis"];

        super(1, supportedVideoCodecs, supportedAudioCodecs, "doseApp");
    }
}

module.exports = DoseApp;
