const { resolve } = require('path');
const { get } = require('powercord/http');
const Plugin = require('powercord/Plugin');
const { inject } = require('powercord/injector');
const { createElement } = require('powercord/util');
const { React, ReactDOM, getModuleByDisplayName } = require('powercord/webpack');

const Badge = require('./Badge.jsx');
const badgesStore = {};

module.exports = class Badges extends Plugin {
  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchUserComponent();
  }

  _patchUserComponent () {
    const UserProfile = getModuleByDisplayName('UserProfile');

    inject('pc-badges-fetch', UserProfile.prototype, 'fetchPowercordBadges', async function () { // eslint-disable-line
      /* eslint-disable no-invalid-this */
      if (this.userID !== this.props.user.id) {
        this.badges = null;
        this.userID = this.props.user.id;
        if (!badgesStore[this.userID]) {
          try {
            const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
            badgesStore[this.userID] = await get(`${baseUrl}/api/users/${this.userID}`).then(res => res.body);
          } catch (e) {
            // Let it fail silently, probably just 404
          }
        }

        this.badges = badgesStore[this.userID];
        this.forceUpdate();
        /* eslint-enable no-invalid-this */
      }
    });

    inject('pc-badges-mount', UserProfile.prototype, 'componentDidMount', function () { // eslint-disable-line
      this.fetchPowercordBadges(); // eslint-disable-line no-invalid-this
    });

    inject('pc-badges-update', UserProfile.prototype, 'componentDidUpdate', async function () { // eslint-disable-line
      /* eslint-disable no-invalid-this */
      await this.fetchPowercordBadges();
      if (this.badges && document.querySelector('.pc-profileBadges')) { // @todo: Create element if not existing
        const el = document.querySelector('.pc-profileBadges .powercord-badges');
        if (el) {
          el.remove();
        }

        const element = createElement('div', { className: 'powercord-badges' });
        document.querySelector('.pc-profileBadges').appendChild(element);

        if (this.badges.developer) {
          const developerE = createElement('div');
          element.appendChild(developerE);
          ReactDOM.render(React.createElement(Badge, { badge: 'developer' }), developerE);
        }

        if (this.badges.contributor) {
          const contributorE = createElement('div');
          element.appendChild(contributorE);
          ReactDOM.render(React.createElement(Badge, { badge: 'contributor' }), contributorE);
        }

        if (this.badges.tester) {
          const testerE = createElement('div');
          element.appendChild(testerE);
          ReactDOM.render(React.createElement(Badge, { badge: 'tester' }), testerE);
        }

        if (this.badges.hunter) {
          const hunterE = createElement('div');
          element.appendChild(hunterE);
          ReactDOM.render(React.createElement(Badge, { badge: 'hunter' }), hunterE);
        }
      }
      /* eslint-enable no-invalid-this */
    });
  }
};
