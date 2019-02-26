const { resolve } = require('path');
const Plugin = require('powercord/Plugin');
const { inject, uninject } = require('powercord/injector');
const { getModuleByDisplayName, React, getModule } = require('powercord/webpack');
const GeneralSettings = require('./components/GeneralSettings.jsx');

module.exports = class Settings extends Plugin {
  constructor () {
    super();

    this.sections = [];
  }

  start () {
    // The reason why I do that is because settings may be required by plugins that are designed to work in overlay
    if (window.__OVERLAY__) {
      this.log('Note: started in compatibility mode');
      return;
    }
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.patchExperiments();
    this.patchSettingsComponent();
    this.register('pc-general', 'General Settings', GeneralSettings);
  }

  unload () {
    if (window.__OVERLAY__) {
      return;
    }
    this.unloadCSS();
    uninject('pc-settings-items');
    uninject('pc-settings-errorHandler');
    this.unregister('pc-general');
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

  unregister (key) {
    this.sections = this.sections.filter(s => s.section !== key);
  }

  patchExperiments () {
    const experimentsModule = getModule(r => r.isDeveloper !== void 0);
    Object.defineProperty(experimentsModule, 'isDeveloper', {
      get: () => powercord.settings.get('experiments', false)
    });
  }

  async patchSettingsComponent () {
    const _this = this;
    const SettingsView = await getModuleByDisplayName('SettingsView');
    inject('pc-settings-items', SettingsView.prototype, 'getPredicateSections', (args, sections) => {
      const changelog = sections.find(c => c.section === 'changelog');
      if (changelog) {
        sections.splice(
          sections.indexOf(changelog), 0,
          {
            section: 'HEADER',
            label: 'Powercord'
          },
          ..._this.sections,
          { section: 'DIVIDER' }
        );
      }

      if (sections.find(c => c.section === 'CUSTOM')) {
        sections.find(c => c.section === 'CUSTOM').element = ((_element) => function () {
          const res = _element();
          if (res.props.children.length === 3) {
            res.props.children.unshift(
              Object.assign({}, res.props.children[0], {
                props: Object.assign({}, res.props.children[0].props, {
                  href: 'https://powercord.xyz',
                  title: 'Powercord',
                  className: `${res.props.children[0].props.className} powercord-pc-icon`
                })
              })
            );
          }
          return res;
        })(sections.find(c => c.section === 'CUSTOM').element);
      }

      return sections;
    });

    inject('pc-settings-errorHandler', SettingsView.prototype, 'componentDidCatch', () => {
      this.error('nee jij discord :) (There should be an error just before this message)');
    });
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
