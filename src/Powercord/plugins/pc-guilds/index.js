const { resolve } = require('path');
const Plugin = require('powercord/Plugin');
const { createElement } = require('powercord/util');
const { React, ReactDOM, getModuleByDisplayName } = require('powercord/webpack');

const Guilds = require('./components/Guilds.jsx');
const CreateFolder = require('./components/CreateFolder.jsx');

module.exports = class GuildFolders extends Plugin {
  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuilds();
    this._patchAddGuild();
  }

  _patchGuilds () {
    const DGuilds = getModuleByDisplayName('Guilds');

    // eslint-disable-next-line func-names
    DGuilds.prototype.render = (_render => function (...args) {
      const res = _render.call(this, ...args);
      res.props.children[1].props.children[4] = React.createElement(Guilds, Object.assign({}, this.props, {
        setRef: (key, e) => {
          this.guildRefs[key] = e;
        }
      }));
      return res;
    })(DGuilds.prototype.render);
  }

  _patchAddGuild () {
    const AddGuild = getModuleByDisplayName('AddGuildModal');

    // eslint-disable-next-line func-names
    AddGuild.prototype.componentDidMount = ((_old) => function (...args) { // eslint-disable-line
      if (_old) {
        _old.call(this, ...args);
      }

      const actions = document.querySelector('.pc-createGuildDialog header + .pc-actions');

      if (actions) {
        const element = createElement('div', { id: 'powercord-create-folder' });
        ReactDOM.render(React.createElement(CreateFolder), element);

        actions.parentElement.appendChild(element);
      }
    })(AddGuild.prototype.componentDidMount);

    AddGuild.prototype.componentDidUpdate = ((_old) => function (...args) { // eslint-disable-line
      if (_old) {
        _old.call(this, ...args);
      }

      const actions = document.querySelector('.pc-createGuildDialog header + .pc-actions');

      if (actions && !document.querySelector('#powercord-create-folder')) {
        const element = createElement('div', { id: 'powercord-create-folder' });
        ReactDOM.render(React.createElement(CreateFolder), element);

        actions.parentElement.appendChild(element);
      }
    })(AddGuild.prototype.componentDidUpdate);

    AddGuild.prototype.render = (_render => function (...args) { // eslint-disable-line
      const res = _render.call(this, ...args);
      res.props.className += ' pc-createGuildDialog';
      return res;
    })(AddGuild.prototype.render);
  }
};
