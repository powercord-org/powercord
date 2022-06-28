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
  isExperimentEnabled (experimentId) {
    const labs = powercord.settings.get('labs', []);
    return Array.isArray(labs) && labs.includes(experimentId);
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

    let labs = powercord.settings.get('labs', [])?.filter(e => e !== experimentId);
    if (!Array.isArray(labs)) {
      labs = [];
    }
    labs.push(experimentId);
    powercord.settings.set('labs', labs);

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

    let labs = powercord.settings.get('labs', [])?.filter(e => e !== experimentId);
    if (!Array.isArray(labs)) {
      labs = [];
    }
    powercord.settings.set('labs', labs);

    if (experiment.callback) {
      experiment.callback(false);
    }
  }
}

module.exports = LabsAPI;
