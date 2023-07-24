const db = require('./db');

class Settings {
  async #getSettingsObject() {
    return db.one('SELECT * FROM settings LIMIT 1');
  }

  async ish265Enabled() {
    const settings = await this.#getSettingsObject();
    return settings.h265;
  }
}

module.exports = Settings;