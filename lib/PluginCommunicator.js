const fs = require('fs');
const Logger = require('./logger');
const Plugin = require('../plugins/Plugin');

const logger = new Logger();
const PLUGIN_PATH = 'plugins/';

class PluginCommunicator {
  constructor() {
    this.plugins = this.loadPlugins();
  }

  onStart() {
    for (const plugin of this.plugins) {
      if (plugin.data.onStart) {
        plugin.data.onStart();
      }
    }

    this.setupTimeIntervals(this.plugins);
  }

  /**
   * Instanciate every default exported class in the plugins directory
   * We only instanciate the class inside plugins/<PLUGIN-DIRECTORY>/main.js
   * If the plugins "enabled" setting is false, it won't be instanciated
   * 
   * @returns {{
   * data: Plugin,
   * name: string,
   * config: JSON
   * }}
   */
  loadPlugins() {
    const dirents = fs.readdirSync(PLUGIN_PATH, { withFileTypes: true });
    const folders = dirents.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
    const plugins = [];
    for (const folder of folders) {
      const Plugin = require(`../${PLUGIN_PATH}${folder}/main.js`);
      const config = require(`../${PLUGIN_PATH}${folder}/config.json`);
      const name = config.metadata.displayName;

      if (config.settings?.enabled?.value === false) {
        logger.DEBUG(`Not enabling ${name} plugin since it's disabled`);
        continue;
      }

      const plugin = new Plugin();
      plugin.setConfigPath(`${folder}/config.json`);

      plugins.push({
        data: plugin,
        name: name,
        config: config
      });
      logger.DEBUG(`Loaded plugin ${config.metadata.displayName}`);
    }
    return plugins;
  }

  /**
   * Setup all time intervals for the plugins that require it
   * Using the "timeInterval" setting from the plugins
   * 
   * @param {{
   * data: Plugin,
   * name: string,
   * config: JSON
   * }} plugins
   */
  setupTimeIntervals(plugins) {
    for (const plugin of plugins) {
      const config = plugin.config;
      if (config.settings.timeInterval && plugin.data.onInterval) {
        const intervalTime = config.settings.timeInterval.value * 1000;
        setInterval(plugin.data.onInterval.bind(plugin.data), intervalTime);
        logger.DEBUG(`Set time interval to ${intervalTime} for plugin ${plugin.name}`);
      }
    }
  }
}

module.exports = PluginCommunicator;