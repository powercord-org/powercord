const Plugin = require('powercord/Plugin');
const { getModuleByDisplayName, React, getModule } = require('powercord/webpack');
const GeneralSettings = require('./GeneralSettings.jsx');

module.exports = class Settings extends Plugin {
  constructor () {
    super({
      dependencies: [ 'pc-classNameNormalizer' ] // Required by some components
    });

    this.sections = [];
  }

  start () {
    this.patchExperiments();
    this.patchSettingsComponent();
    this.register('pc-general', 'General Settings', GeneralSettings);
  }

  register (key, displayName, render) {
    if (!key.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a settings panel with an invalid ID! You can only use letters, numbers, dashes and underscores. (ID: ${key})`);
    }

    if (this.sections.find(s => s.key === key)) {
      return this.error(`Key ${key} is already used by another plugin!`);
    }
    this.sections.push({
      section: key,
      label: displayName,
      element: this._renderSettingsPanel.bind(this, displayName, render)
    });
  }

  patchExperiments () {
    const experimentsModule = getModule(r => r.isDeveloper !== void 0);
    Object.defineProperty(experimentsModule, 'isDeveloper', {
      get: () => powercord.settings.get('experiments', false)
    });
  }

  patchSettingsComponent () {
    const SettingsView = getModuleByDisplayName('SettingsView');
    SettingsView.prototype.getPredicateSections = ((_getter, pluginSections) => function (...args) { // eslint-disable-line
      const sections = _getter.call(this, ...args);
      const changelog = sections.find(c => c.section === 'changelog');
      if (changelog) {
        sections.splice(
          sections.indexOf(changelog), 0,
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

    SettingsView.prototype.componentDidCatch = () => {
      this.error('nee jij discord :) (There should be an error just before this message)');
    };
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
