const { API } = require('powercord/entities');

/**
 * @typedef PowercordExperiment
 * @property {String} id
 * @property {String} name
 * @property {Number} date
 * @property {String} description
 * @property {function({Boolean} enabled)|function()|null} callback
 */

/**
 * @property {PowercordExperiment[]} experiments
 */
class LabsAPI extends API {
  constructor () {
    super();

    this.experiments = [];
  }

  /**
   * Registers an experiment
   * @param {PowercordExperiment} experiment
   */
  registerExperiment (experiment) {
    this.experiments.push(experiment);
  }

  /**
   * Unregisters an experiment
   * @param {String} experimentId
   */
  unregisterExperiment (experimentId) {
    this.experiments = this.experiments.filter(e => e.id !== experimentId);
  }

  /**
   * @param {String} experimentId
   * @returns {Boolean} Whether the experiment is enabled or not
   */
  isExperimentEnabled (experimentId ) {
    const settings = powercord.settings.get('labs', {});
    return !!settings[experimentId];
  }

  /**
   * Enables an experiment
   * @param {String} experimentId
   */
  enableExperiment (experimentId) {
    const experiment = this.experiments.find(e => e.id === experimentId);
    if (!experiment) {
      throw new Error(`Tried to enable a non-registered experiment "${experimentId}"`);
    }
    powercord.settings.set('labs', {
      ...powercord.settings.get('labs', {}),
      [`${experimentId}`]: true
    });
    if (experiment.callback) {
      experiment.callback(true);
    }
  }

  /**
   * Disables an experiment
   * @param {String} experimentId
   */
  disableExperiment (experimentId) {
    const experiment = this.experiments.find(e => e.id === experimentId);
    if (!experiment) {
      throw new Error(`Tried to enable a non-registered experiment "${experimentId}"`);
    }
    const settings = powercord.settings.get('labs', {});
    if (settings[experimentId]) {
      delete settings[experimentId];
    }
    powercord.settings.set('labs', settings);
    if (experiment.callback) {
      experiment.callback(false);
    }
  }
}

module.exports = LabsAPI;
