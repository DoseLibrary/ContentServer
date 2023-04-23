class Plugin {
  /**
   * Called when the server has started
   */
  onStart() {}

  /**
   * Called every X milliseconds, configured by the "timeInterval" setting
   * in the plugins config.json file
   */
  onInterval() {}
}

module.exports = Plugin;