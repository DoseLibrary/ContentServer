const ffmpeg = require('fluent-ffmpeg');
const Logger = require('../logger');
const logger = new Logger();

class Content {
  getFilePath() {
    throw new Error('Not implemented');
  }

  getResolutions() {
    throw new Error('Not implemented');
  }

  getSubtitles() {
    throw new Error('Not implemented');
  }

  getAudioCodecs() {
    throw new Error('Not implemented');

  }

  getAudioCodecByStreamIndex(streamIndex) {
    throw new Error('Not implemented');
  }

  getName() {
    throw new Error('Not implemented');
  }

  getType() {
    throw new Error('Not implemented');
  }

  getBackdrop() {
    throw new Error('Not implemented');
  }

  getLanguages() {
    throw new Error('Not implemented');
  }

  removeAllLanguages() {
    throw new Error('Not implemented');
  }

  addLanguage() {
    throw new Error('Not implemented');
  }

  async getHdrData() {
    const filePath = await this.getFilePath();

    return new Promise(resolve => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.ERROR('An error happened when trying to get HDR data with ffprobe: ' + err);
        }
  
        // TODO: What if we have multiple video streams? Same thing in library where we get the resolutions
        for (const stream of metadata.streams) {
          if (stream.codec_type === 'video') {
            const colorInfoExists =
              stream.color_space !== 'unknown' &&
              stream.color_transfer !== 'unknown' &&
              stream.color_primaries !== 'unknown';
  
            const data = {
              pixFmt: stream.pix_fmt,
              colorInfoExists: colorInfoExists,
              colorSpace: stream.color_space,
              colorTransfer: stream.color_transfer,
              colorPrimaries: stream.color_primaries
            }
            logger.DEBUG(`HDR data: ${JSON.stringify(data)}`);
            resolve(data);
            return;

          }
        }
  
        logger.WARNING('No video stream found, defaulting to no HDR and pix_fmt yuv420p')
        // If no data found, default yuv420p
        resolve({
          pixFmt: 'yuv420p',
          hdrSupported: false
        });
      });
    });
  }
}

module.exports = Content;