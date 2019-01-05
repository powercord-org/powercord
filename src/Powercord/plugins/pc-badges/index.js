const { resolve } = require('path');
const { get } = require('powercord/http');
const Plugin = require('powercord/Plugin');
const { createElement } = require('powercord/util');
const { React, ReactDOM, getModuleByDisplayName } = require('powercord/webpack');

const Badge = require('./Badge.jsx');

module.exports = class Badges extends Plugin {
  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchUserComponent();
  }

  _patchUserComponent () {
    const UserProfile = getModuleByDisplayName('UserProfile');
    UserProfile.prototype.componentDidMount = ((_old) => async function (...args) { // eslint-disable-line
      if (_old) {
        _old.call(this, ...args);
      }

      try {
        const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
        this.badges = await get(`${baseUrl}/api/users/${this.props.user.id}`).then(res => res.body);
        this.forceUpdate();
      } catch (e) {
        // Let it fail silently, probably just 404
      }
    })(UserProfile.prototype.componentDidMount);

    UserProfile.prototype.componentDidUpdate = ((_old) => function (...args) { // eslint-disable-line
      if (_old) {
        _old.call(this, ...args);
      }

      if (this.badges) {
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
    })(UserProfile.prototype.componentDidUpdate);
  }
};

