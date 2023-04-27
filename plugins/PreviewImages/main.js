const path = require('path');
const util = require('util');
const fs = require('fs');
const fsExists = util.promisify(fs.exists)
const fsMkdir = util.promisify(fs.mkdir)
const ffmpeg = require('fluent-ffmpeg');
const Movie = require("../../lib/media/Movie");
const Plugin = require("../Plugin");
const Logger = require('../../lib/logger');
const Episode = require('../../lib/media/Episode');

const logger = new Logger();

class PreviewImages extends Plugin {
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
    const processed = await this.getProcessed();
    const failed = await this.getFailed();

    const movies = await this.getMovieCandidates(processed, failed);
    const episodes = await this.getEpisodeCandidates(processed, failed);
    const candidates = movies.concat(episodes);

    if (candidates.length > 0) {
      logger.INFO(`Extracting preview images for ${candidates.length} file(s)`);
    } else {
      logger.DEBUG(`No files to extract preview images for`);
      this.executing = false;
      return;
    }

    for (const candidate of candidates) {
      const filePath = await candidate.getFilePath();
      const name = await candidate.getName();

      try {
        await this.extractImages(filePath, candidate.episode_number);
        this.addToProcessed(candidate.getType(), candidate.id);
        logger.DEBUG(`Extracted preview images for ${name}`);
      } catch (err) {
        logger.ERROR(`Failed to extract preview images for ${name}`);
        logger.ERROR(JSON.stringify(err));
        this.addToFailed(candidate.getType(), candidate.id);
      }
    }
    logger.INFO('Finished extracting images for all files');
    this.executing = false;
  }

  async extractImages(filePath, episode) {
    const outputDir = episode == undefined ?
      path.join(path.dirname(filePath), 'preview_images') :
      path.join(path.dirname(filePath), `preview_images/e${episode}`);
    const outputFile = path.join(outputDir, '/img%04d.jpg');

    if (!(await fsExists(outputDir))) {
      await fsMkdir(outputDir, { recursive: true });
    }

    const inputOptions = await this.shouldUseFastExtraction() ? [] : ['-re'];
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .inputOptions(inputOptions)
        .outputOptions([
          '-s 256x144',
          '-r 0.1'
        ])
        .on('end', () => {
          resolve(outputFile);
        })
        .on('error', (err, stdout, stderr) => {
          reject({
            err: err,
            stdout: stdout,
            stderr: stderr
          })
        })
        .output(outputFile)
        .run();
    });
  }

  /**
   * 
   * @returns {Movie[]}
   */
  async getMovieCandidates(processed, failed) {
    const movies = await Movie.GetAll();
    const unhandled = movies.filter(movie => !processed.some(e => e.id === movie.id && e.type === 'movie'));
    return unhandled.filter(movie => !failed.some(e => e.id === movie.id && e.type === 'movie'));
  }

  /**
 * 
 * @returns {Episode[]}
 */
  async getEpisodeCandidates(processed, failed) {
    const episodes = await Episode.GetAll();
    const unhandled = episodes.filter(episode => !processed.some(e => e.id === episode.id && e.type === 'show'));
    return unhandled.filter(episode => !failed.some(e => e.id === episode.id && e.type === 'show'));
  }

  async shouldUseFastExtraction() {
    const config = await this.getConfig();
    return config.settings.fast.value;
  }
}

module.exports = PreviewImages;