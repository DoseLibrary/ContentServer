const db = require('./db');

class Settings {
  async #getSettingsObject() {
    return db.one('SELECT * FROM settings LIMIT 1');
  }

  async ish265Enabled() {
    const settings = await this.#getSettingsObject();
    return settings.h265;
  }

  async getH264Settings() {
    const settings = await this.#getSettingsObject();
    return {
      crf: settings.h264_crf,
      preset: settings.h264_preset,
      threads: settings.h265_threads
    }
  }

  async getH265Settings() {
    const settings = await this.#getSettingsObject();
    return {
      crf: settings.h265_crf,
      preset: settings.h265_preset,
      threads: settings.h265_threads
    };
  }
}

module.exports = Settings;