const fs = require('fs');
const path = require('path');
const AsyncLock = require('node-async-locks').AsyncLock;

class Plugin {
  #configPath;
  #lock = new AsyncLock();

  /**
 * Called when the server has started
 */
  onStart() { }

  /**
   * Called every X milliseconds, configured by the "timeInterval" setting
   * in the plugins config.json file
   */
  onInterval() { }

  async #writeConfig(data) {
    return new Promise((resolve, reject) => {
      const config = path.join(__dirname, this.#configPath);
      fs.writeFileSync(config, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 
   * @returns {{
   * type: string,
   * id: number
   * }[]}
   */
  async getProcessed() {
    const config = await this.getConfig();
    if (config.data?.processed?.data == undefined) {
      throw 'config.data.processed.data does not exist';
    }
    return config.data.processed.data;
  }

  /**
 * 
 * @returns {{
  * type: string,
  * id: number
  * }[]}
  */
  async getFailed() {
    const config = await this.getConfig();
    if (config.data?.failed?.data == undefined) {
      throw 'config.data.failed.data does not exist';
    }
    return config.data.failed.data;
  }

  /**
   * Set the relative path to the config
   * @param {string} path 
   */
  setConfigPath(path) {
    this.#configPath = path;
  }

  addToProcessed(type, id) {
    this.#lock.enter(async (token) => {
      const config = await this.getConfig();
      if (config.data?.processed?.data == undefined) {
        this.#lock.leave(token);
        throw 'config.data.processed.data does not exist';
      }

      config.data.processed.data.push({
        type,
        id
      });
      await this.#writeConfig(JSON.stringify(config, null, 2));
      this.#lock.leave(token);
    });
  }

  addToFailed(type, id) {
    this.#lock.enter(async (token) => {
      const config = await this.getConfig();
      if (config.data?.failed?.data == undefined) {
        this.#lock.leave(token);
        throw 'config.data.failed.data does not exist';
      }

      config.data.failed.data.push({
        type,
        id
      });
      await this.#writeConfig(JSON.stringify(config, null, 2));
      this.#lock.leave(token);
    });
  }

  async getConfig() {
    return new Promise((resolve, reject) => {
      const config = path.join(__dirname, this.#configPath);
      fs.readFile(config, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }
}

module.exports = Plugin;