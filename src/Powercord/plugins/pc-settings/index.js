const Plugin = require('powercord/Plugin');
const { getModuleByDisplayName, React } = require('powercord/webpack');
const GeneralSettings = require('./GeneralSettings.jsx');

module.exports = class Settings extends Plugin {
  constructor () {
    super({
      dependencies: [ 'pc-classNameNormalizer' ] // Required by some components
    });

    this.sections = [];
  }

  start () {
    Object.defineProperty(require('powercord/webpack').getModule(r => typeof r.isDeveloper !== 'undefined'), 'isDeveloper', { get: () => powercord.settingsManager.get('experiments', false) });
    this.patchSettingsComponent();
    this.register('pc-general', 'General Settings', GeneralSettings);
  }

  register (key, displayName, render) {
    if (!key.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a settings panel with an invalid ID! You can only use letters, numbers, dashes and underscores. (ID: ${key})`);
    }

    if (this.sections.filter(s => s.key === key).length !== 0) {
      return this.error(`Key ${key} is already used by another plugin!`);
    }
    this.sections.push({
      section: key,
      label: displayName,
      element: this._renderSettingsPanel.bind(this, displayName, render)
    });
  }

  patchSettingsComponent () {
    const SettingsView = getModuleByDisplayName('SettingsView');
    SettingsView.prototype.getPredicateSections = ((_getter, pluginSections) => function (...args) { // eslint-disable-line
      const sections = _getter.call(this, ...args);
      const changelog = sections.filter(c => c.section === 'changelog');
      if (changelog.length !== 0) {
        sections.splice(
          sections.indexOf(changelog[0]), 0,
          {
            section: 'HEADER',
            label: 'Powercord'
          },
          ...pluginSections,
          { section: 'DIVIDER' }
        );
      }
      return sections;
    })(SettingsView.prototype.getPredicateSections, this.sections);

    SettingsView.prototype.componentDidCatch = (() => () => {
      this.error('nee jij discord :)');
    })(SettingsView.prototype.componentDidCatch);
  }

  _renderSettingsPanel (title, contents) {
    let panelContents;
    try {
      panelContents = React.createElement(contents);
    } catch (e) {
      this.error('Failed to render settings panel, check if your function returns a valid React component!');
      panelContents = null;
    }

    const h2 = React.createElement(getModuleByDisplayName('FormTitle'), { tag: 'h2' }, title);
    return React.createElement(getModuleByDisplayName('FormSection'), {}, h2, panelContents);
  }
};
