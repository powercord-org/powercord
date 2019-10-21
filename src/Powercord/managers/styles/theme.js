/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
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

const { createElement } = require('powercord/util');
const { resolve, dirname } = require('path');
const { readFile } = require('fs').promises;
const { existsSync } = require('fs');
const watch = require('node-watch');
const { render: renderSCSS } = require('sass');
const stylus = require('stylus');
const less = require('less');

const regex = /\.((s?c|le)ss|styl)$/;

module.exports = class Theme {
  constructor (themeID, manifest, isTheme) {
    // @todo: Validate more than actual theme. Not needed for now as plugins key is useless
    if (!regex.test(manifest.theme)) {
      throw new Error('Invalid theme file!');
    }

    this.themeID = themeID;
    this.manifest = manifest;
    this.isTheme = isTheme;
    this.trackedFiles = [];
  }

  async apply () {
    let element = document.head.querySelector(`#powercord-css-${this.themeID}`);
    if (!element) {
      document.head.appendChild(
        element = createElement('style', { id: `powercord-css-${this.themeID}` })
      );
    }

    const stylesheet = await this._compileStylesheet();

    // Update CSS
    element.innerHTML = stylesheet.data;

    // Filter no longer used watchers
    this.trackedFiles = this.trackedFiles.filter(tf => {
      if (!stylesheet.includes.includes(tf.file)) {
        tf.watcher.close();
        return false;
      }
      // noinspection JSPrimitiveTypeWrapperUsage
      stylesheet.includes = stylesheet.includes.filter(i => i !== tf.file);
      return true;
    });

    // Add new watchers
    stylesheet.includes.forEach(file => {
      const watcher = watch(file, this._handleUpdate.bind(this));
      this.trackedFiles.push({
        file,
        watcher
      });
    });
  }

  remove () {
    const element = document.head.querySelector(`#powercord-css-${this.themeID}`);
    if (element) {
      element.remove();
    }
    this.trackedFiles.forEach(tf => tf.watcher.close());
    this.trackedFiles = [];
  }

  async _compileStylesheet () {
    let stylesheet = await readFile(this.manifest.theme, 'utf8');
    switch (this.manifest.theme.split('.').pop()) {
      case 'scss':
        stylesheet = await this._renderSCSS(stylesheet);
        break;
      case 'less':
        stylesheet = await this._renderLess(stylesheet);
        break;
      case 'styl':
        stylesheet = await this._renderStylus(stylesheet);
        break;
      default:
        stylesheet = {
          data: stylesheet,
          includes: [ this.manifest.theme ]
        };
    }

    // @todo: Process the file and remove dynamic selectors
    return stylesheet;
  }

  _renderSCSS (rawScss) {
    return new Promise((res, rej) => {
      renderSCSS({
        data: rawScss,
        includePaths: [ dirname(this.manifest.theme) ],
        importer: (url, prev) => {
          url = url.replace('file:///', '');
          if (existsSync(url)) {
            return { file: url };
          }

          const prevFile = prev === 'stdin' ? this.manifest.theme : prev.replace(/https?:\/\/(?:[a-z]+\.)?discordapp\.com/i, '');
          return {
            file: resolve(dirname(decodeURI(prevFile)), url).replace(/\\/g, '/')
          };
        }
      }, (err, compiled) => {
        if (err) {
          return rej(err);
        }

        res({
          data: compiled.css.toString(),
          includes: [
            this.manifest.theme,
            ...compiled.stats.includedFiles.map(f => decodeURI(f).replace(/\\/g, '/').replace(/https?:\/\/(?:[a-z]+\.)?discordapp\.com/i, ''))
          ]
        });
      });
    });
  }

  async _renderLess (rawLess) {
    const results = await less.render(rawLess, {
      paths: [ dirname(this.manifest.theme) ]
    });

    return {
      data: results.css,
      includes:  [
        this.manifest.theme,
        ...results.imports.filter(i => !i.startsWith('http'))
      ]
    };
  }

  _renderStylus (rawStylus) {
    return new Promise((res, rej) => {
      const renderer = stylus(rawStylus)
        .include(dirname(this.manifest.theme));

      renderer.render((err, css) => {
        if (err) {
          return rej(err);
        }

        res({
          data: css,
          includes: [
            this.manifest.theme,
            ...renderer.deps()
          ]
        });
      });
    });
  }

  // eslint-disable-next-line no-unused-vars
  _handleUpdate (evt, _) {
    if (evt === 'update') {
      this.apply();
    } else if (evt === 'remove') {
      this.remove();
    }
  }

  static fromFile (themeID, file) {
    return new Theme(themeID, {
      name: themeID,
      version: '1.0.0',
      description: 'No description provided',
      author: 'Unknown',
      license: 'Unknown',
      theme: file,
      overlayTheme: file
    }, false);
  }
};
