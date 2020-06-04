const { getModuleByDisplayName } = require('powercord/webpack');

const Autocomplete = getModuleByDisplayName('Autocomplete', false);

module.exports = class Title extends Autocomplete.Title {
  render () {
    const res = super.render();
    if (!this.props.title[0]) {
      res.props.children = null;
      res.props.style = { padding: '4px' };
    }

    return res;
  }
};
