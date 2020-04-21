/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { API } = require('powercord/entities');

/**
 * @typedef PowercordExperiment
 * @property {String} id
 * @property {String} name
 * @property {Number} date
 * @property {String} description
 * @property {Boolean} usable
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
    return powercord.settings.get('labs', []).includes(experimentId);
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
    powercord.settings.set('labs', [
      ...powercord.settings.get('labs', []),
      experimentId
    ]);
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
    powercord.settings.set('labs', powercord.settings.get('labs', []).filter(e => e !== experimentId));
    if (experiment.callback) {
      experiment.callback(false);
    }
  }
}

module.exports = LabsAPI;
