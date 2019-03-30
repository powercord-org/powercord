const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { WEBSITE } = require('powercord/constants');
const { inject, uninject } = require('powercord/injector');
const { getModuleByDisplayName, getModule } = require('powercord/webpack');

const GeneralSettings = require('./components/GeneralSettings.jsx');

module.exports = class Settings extends Plugin {
  startPlugin () {
    this.registerSettings('pc-general', 'General Settings', GeneralSettings);

    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.patchSettingsComponent();
    this.patchExperiments();
  }

  pluginWillUnload () {
    this.unloadCSS();
    uninject('pc-settings-items');
    uninject('pc-settings-errorHandler');
  }

  patchExperiments () {
    try {
      const experimentsModule = getModule(r => r.isDeveloper !== void 0);
      Object.defineProperty(experimentsModule, 'isDeveloper', {
        get: () => powercord.settings.get('experiments', false)
      });
    } catch (_) {
      // memes
    }
  }

  async patchSettingsComponent () {
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
          ...powercord.api.settings.tabs,
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
                  href: WEBSITE,
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
};
