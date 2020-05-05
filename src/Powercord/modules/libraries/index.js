/**
 * Powercord, a lightweight @discord client mod focused on simplicity and performance
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

const libraries = require('./libraries.json');

module.exports = () => {
  for (const library of libraries) {
    let elem;

    switch (library.type) {
      case 'css':
        elem = document.createElement('link');
        elem.setAttribute('rel', 'stylesheet');
        elem.setAttribute('href', library.url);
        break;

      case 'js':
        elem = document.createElement('script');
        elem.setAttribute('src', library.url);
        break;

      default:
        console.error('Unsupported library type', library.type, 'for library', library.url);
    }

    document.head.appendChild(elem);
  }
};
