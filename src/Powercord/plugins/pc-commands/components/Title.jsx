const { React, getModuleByDisplayName } = require('powercord/webpack');

const Autocomplete = getModuleByDisplayName('Autocomplete', false);

module.exports = Autocomplete.Title;
