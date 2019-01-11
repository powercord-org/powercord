const { resolve } = require('path');
const Plugin = require('powercord/Plugin');
const { React, getModuleByDisplayName } = require('powercord/webpack');
const Guilds = require('./components/Guilds.jsx');

module.exports = class DoNotTrack extends Plugin {
  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));

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
};
