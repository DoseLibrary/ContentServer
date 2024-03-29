const db = require('../db');
const Content = require('./Content');
const Logger = require('../logger');
const path = require('path');

const logger = new Logger();

class Episode extends Content {
  #episodeId;
  constructor(episodeId) {
    super();
    this.#episodeId = episodeId;
  }

  // TODO: Should probably be in baseclass "Content"
  get id() {
    return this.#episodeId;
  }

  static GetAll() {
    return new Promise((resolve, reject) => {
      db.any('SELECT * FROM serie_episode').then(data => {
        // Convert BigInt in postgres to int
        const result = data.map(episode => new Episode(parseInt(episode.id)));
        resolve(result);
      }).catch(error => {
        logger.ERROR("Failed listing movies");
        reject(error);
      })
    });
  }

  /**
   * Returns the presented name of the episode
   */
  getName() {
    return new Promise((resolve, reject) => {
      this.getInfoFromInternalEpisodeId().then(result => {
        db.one('SELECT title FROM serie_metadata WHERE serie_id = $1', [result.serie_id]).then(show => {
          resolve(`${show.title} - S${result.season_number}E${result.episode}`);
        }).catch(error => {
          logger.ERROR(`Error getting show name: ${error}`);
          reject();
        });
      })
        .catch(() => {
          reject();
        })
    });
  }

  getBackdrop() {
    return new Promise((resolve, reject) => {
      db.one(`SELECT serie_id FROM serie_episode WHERE id = $1`, [this.#episodeId]).then(result => {
        db.one(`SELECT path FROM image
                INNER JOIN serie_image
                ON image.id = serie_image.image_id
                WHERE serie_image.serie_id = $1 AND serie_image.active = true AND serie_image.type = 'BACKDROP'`, [result.serie_id]).then(result => {
          resolve(result.path);
        }).catch(error => {
          logger.ERROR(`Error getting backdrop: ${error}`);
          reject();
        });
      });
    });
  }

  getFilePath() {
    return new Promise((resolve, reject) => {
      db.one(`SELECT DISTINCT serie_episode.path AS subpath, library.path AS basepath FROM serie_episode
            INNER JOIN serie
            ON serie.id = serie_episode.serie_id

            INNER JOIN library
            ON serie.library = library.id

            WHERE serie_episode.id = $1`, [this.#episodeId])
        .then(result => {
          resolve(path.join(result.basepath, result.subpath));
        })
        .catch(error => {
          logger.ERROR(error);
          reject()
        })
    });
  }

  getResolutions() {
    return new Promise((resolve, reject) => {
      db.one('SELECT "240p", "360p", "480p", "720p", "1080p", "1440p", "4k", "8k", "codec" FROM serie_episode_resolution WHERE episode_id = $1', [this.#episodeId]).then(result => {
        resolve(result);
      }).catch(error => {
        logger.ERROR(`Error getting episode resolution: ${error}`);
        reject();
      });
    });
  }

  getSubtitles() {
    return new Promise((resolve, reject) => {
      db.any('SELECT id, language, synced, extracted FROM serie_episode_subtitle WHERE episode_id = $1', [this.#episodeId]).then(subtitles => {
        resolve(subtitles);
      });
    });
  }

  getAudioCodecs() {
    throw new Error('Not implemented');
  }

  getAudioCodecByStreamIndex(streamIndex) {
    return new Promise((resolve, reject) => {
      db.one("SELECT language, codec, stream_index FROM serie_episode_language WHERE serie_episode_id = $1 AND stream_index = $2", [this.#episodeId, streamIndex]).then(result => {
        resolve(result);
      })
        .catch(error => {
          logger.ERROR(`Error getting episode codec ${streamIndex}: ${error}`);
        });
    });
  }

  getInfoFromInternalEpisodeId() {
    return new Promise((resolve, reject) => {
      db.one('SELECT serie_id, episode, season_number FROM serie_episode WHERE id = $1', [this.#episodeId]).then(result => {
        resolve(result);
      }).catch(error => {
        logger.ERROR(`Error getting episode info: ${error}`);
        reject();
      });
    });
  }

  getType() {
    return 'show';
  }

  async getM3u8Path() {
    const videoPath = await this.getFilePath();
    const videoFolder = path.parse(videoPath).dir;
    const fileName = path.parse(videoPath).name + '.m3u8';
    const m3u8Path = path.join(videoFolder, fileName);
    return m3u8Path;
  }

  getLanguages() {
    return new Promise(resolve => {
      db.any(`SELECT language, id, stream_index, codec FROM serie_episode_language WHERE serie_episode_id = $1`, [this.#episodeId]).then(result => {
        resolve(result);
      });
    });
  }

  removeAllLanguages() {
    return new Promise((resolve, reject) => {
      db.none('DELETE FROM serie_episode_language WHERE serie_episode_id = $1', [this.#episodeId]).then(result => {
        resolve();
      }).catch(error => {
        logger.ERROR(`Error removing all languages (TV): ${error}`);
        reject();
      })
    });
  }

  addLanguage(language, streamIndex, codec) {
    return new Promise((resolve, reject) => {
      db.none('INSERT INTO serie_episode_language (serie_episode_id, language, stream_index, codec) VALUES ($1, $2, $3, $4)', [this.#episodeId, language, streamIndex, codec]).then(result => {
        resolve();
      }).catch(error => {
        logger.ERROR(`Error inserting language (TV): ${error}`);
        reject();
      });
    });
  }
}

module.exports = Episode;