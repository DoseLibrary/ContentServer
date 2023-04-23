const path = require('path');
const Plugin = require('../Plugin.js');
const Transcoding = require('../../lib/hls/transcoding.js');
const ffmpeg = require('fluent-ffmpeg');
const db = require('../../lib/db');
const Movie = require('../../lib/media/Movie.js');
const Logger = require('../../lib/logger.js');
const fs = require('fs');
const Episode = require('../../lib/media/Episode.js');
const Content = require('../../lib/media/Content.js');

const logger = new Logger();

class DirectplayPreparation extends Plugin {
  constructor() {
    super();
    this.executing = false;
  }

  onStart() {
    this.run();
  }

  onInterval() {
    if (!this.executing) {
      this.run();
    }
  }

  async run() {
    this.executing = true;
    const movies = await this.getMoviesWithoutAac();
    const episodes = await this.getEpisodesWithoutAac();

    const candidates = movies.concat(episodes);

    if (candidates.length > 0) {
      logger.INFO(`Preparing ${candidates.length} file(s) for directplay`);
    } else {
      logger.DEBUG(`No files to prepare for directplay`);
      this.executing = false;
      return;
    }

    for (const candidate of candidates) {
      const filePath = await candidate.getFilePath();
      const name = await candidate.getName();
      logger.DEBUG(`Converting ${name} to AAC`);

      try {
        const result = await this.convertToAac(filePath);
        await this.copyFile(result, filePath);
        await this.removeFile(result);
        const audioStreams = await this.getAudioStreams(filePath);
        await candidate.removeAllLanguages();
        const promises = audioStreams.map(stream => candidate.addLanguage(stream.language, stream.index, stream.codec));
        await Promise.all(promises);
        logger.DEBUG(`Finished converting ${name} to AAC`);
      } catch (err) {
        logger.ERROR(`Failed to convert ${name} to AAC`);
      }
    }
    logger.INFO(`Finished preparing all files for directplay`);
    this.executing = false;
  }

  /**
   * Remove a file
   * @param {string} path 
   * @returns {void}
   */
  removeFile(path) {
    return new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) {
          logger.ERROR(`Error removing file after directplay convertion: ${err}`);
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Copy a file
   * @param {string} path 
   * @param {string} output 
   * @returns {void}
   */
  copyFile(path, output) {
    return new Promise((resolve, reject) => {
      fs.copyFile(path, output, (err) => {
        if (err) {
          logger.ERROR(`Error copying file after directplay convertion: ${err}`);
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get all the audio streams in a video file
   * 
   * @param {string} path 
   * @returns {{
   * language: string,
   * codec: string,
   * index: number
   * }[]}
   */
  getAudioStreams(path) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(path, (err, metadata) => {
        if (err) {
          logger.ERROR(`Error while trying to use ffprobe on path ${path}. ${err}`);
          reject();
        } else {
          const audioStreams = metadata.streams.filter(stream => stream.codec_type === 'audio');
          resolve(audioStreams.map(stream => {
            return {
              language: stream.tags?.language ?? 'Unknown',
              codec: stream.codec_name,
              index: stream.index
            }
          }));
        }
      });
    });
  }

  /**
   * Convert a video file to AAC
   * @param {string} filePath 
   * @returns {Promise<string>}
   */
  convertToAac(filePath) {
    return new Promise((resolve, reject) => {
      const output = path.join(Transcoding.TEMP_FOLDER, path.basename(filePath));
      ffmpeg(filePath)
        .withVideoCodec('copy')
        .withAudioCodec('aac')
        .inputOptions([
          '-threads 4'
        ])
        .outputOptions([
          '-map 0',
          '-map -v',
          '-map V',
          '-c:s copy'
        ])
        .on('end', () => resolve(output))
        .on('error', (err, stdout, stderr) => {
          reject({ err, stdout, stderr })
        })
        .output(output)
        .run();
    });
  }

  /**
   * Get movies without AAC audio codec
   * 
   * @returns {Movie[]}
   */
  getMoviesWithoutAac() {
    return new Promise(resolve => {
      db.tx(t => {
        t.any('SELECT id FROM movie').then(async (ids) => {
          const movies = ids.map(data => new Movie(data.id));
          const moviesWithoutAac = [];
          for (const movie of movies) {
            const onlyContainsAac = await this.contentOnlyContainsAac(movie);
            if (!onlyContainsAac) {
              moviesWithoutAac.push(movie);
            }
          }
          resolve(moviesWithoutAac);

        });
      });
    });
  }

  getEpisodesWithoutAac() {
    return new Promise(resolve => {
      db.tx(t => {
        t.any('SELECT id FROM serie_episode').then(async (ids) => {
          const episodes = ids.map(data => new Episode(data.id));
          const episodesWithoutAac = [];
          for (const episode of episodes) {
            const onlyContainsAac = await this.contentOnlyContainsAac(episode);
            if (!onlyContainsAac) {
              episodesWithoutAac.push(episode);
            }
          }
          resolve(episodesWithoutAac);
        });
      })
    });
  }

  /**
   * 
   * @param {Content} content 
   */
  async contentOnlyContainsAac(content) {
    const languages = await content.getLanguages();
    return languages.every(language => language.codec === 'aac');
  }
}

module.exports = DirectplayPreparation;