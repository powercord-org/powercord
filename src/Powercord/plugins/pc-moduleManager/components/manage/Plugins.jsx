const { React } = require('powercord/webpack');
const Base = require('./Base');

class Plugins extends Base {
  renderItem (item) {
    console.log(item);
    return <>mhm</>;
  }

  getItems () {
    return this._sortItems([ ...powercord.pluginManager.plugins.values() ]);
  }
}

module.exports = Plugins;
