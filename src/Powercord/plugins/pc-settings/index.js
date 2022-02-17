const { React, getModuleByDisplayName, getModule, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Menu } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');
const { Plugin } = require('powercord/entities');

const ErrorBoundary = require('./components/ErrorBoundary');
const GeneralSettings = require('./components/GeneralSettings');
// const Labs = require('./components/Labs');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

module.exports = class Settings extends Plugin {
  async startPlugin () {
    powercord.api.settings.registerSettings('pc-general', {
      category: 'pc-general',
      label: () => Messages.POWERCORD_GENERAL_SETTINGS,
      render: GeneralSettings
    });

    await this.loadStylesheet('scss/style.scss');

    // Force load
    document.body.classList.add('__powercord-no-settings-animation');
    const layers = await getModule([ 'popLayer' ], false);
    const opener = await getModule([ 'open', 'updateAccount' ], false);
    opener.open();
    layers.popLayer();
    setTimeout(() => document.body.classList.remove('__powercord-no-settings-animation'), 1e3);

    // this.patchSettingsContextMenu();
    this.patchSettingsComponent();
    this.patchExperiments();
  }

  async pluginWillUnload () {
    powercord.api.settings.unregisterSettings('pc-general');
    uninject('pc-settings-items');
    uninject('pc-settings-actions');
    uninject('pc-settings-errorHandler');
  }

  async patchExperiments () {
    try {
      const experimentsModule = await getModule(r => r.isDeveloper !== void 0);
      Object.defineProperty(experimentsModule, 'isDeveloper', {
        get: () => powercord.settings.get('experiments', false)
      });

      // Ensure components do get the update
      experimentsModule._changeCallbacks.forEach(cb => cb());
    } catch (_) {
      // memes
    }
  }

  async patchSettingsComponent () {
    const SettingsView = await getModuleByDisplayName('SettingsView');
    inject('pc-settings-items', SettingsView.prototype, 'getPredicateSections', (_, sections) => {
      if (sections.length < 10) {
        return sections;
      }

      const changelog = sections.find(c => c.section === 'changelog');
      if (changelog) {
        const settingsSections = Object.keys(powercord.api.settings.tabs).map(s => this._makeSection(s));
        sections.splice(
          sections.indexOf(changelog), 0,
          {
            section: 'HEADER',
            label: 'Powercord'
          },
          ...settingsSections,
          { section: 'DIVIDER' }
        );
      }

      if (sections.find(c => c.section === 'CUSTOM')) {
        sections.find(c => c.section === 'CUSTOM').element = ((_element) => function () {
          const res = _element();
          if (res.props.children && res.props.children.length === 3) {
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

      const latestCommitHash = powercord.gitInfos.revision.substring(0, 7);
      const debugInfo = sections[sections.findIndex(c => c.section === 'CUSTOM') + 1];
      if (debugInfo) {
        debugInfo.element = ((_element) => function () {
          const res = _element();
          if (res.props.children && res.props.children.length === 4) {
            res.props.children.push(
              Object.assign({}, res.props.children[0], {
                props: Object.assign({}, res.props.children[0].props, {
                  children: [ 'Powercord', ' ', React.createElement('span', {
                    className: res.props.children[0].props.children[4].props.className,
                    children: [ powercord.gitInfos.branch, ' (', latestCommitHash, ')' ]
                  }) ]
                })
              })
            );
          }
          return res;
        })(debugInfo.element);
      }

      return sections;
    });
  }

  _makeSection (tabId) {
    const props = powercord.api.settings.tabs[tabId];
    const label = typeof props.label === 'function' ? props.label() : props.label;
    return {
      label,
      section: tabId,
      element: () => this._renderWrapper(label, props.render)
    };
  }

  _renderWrapper (label, Component) {
    return React.createElement(ErrorBoundary, null,
      React.createElement(FormSection, {},
        React.createElement(FormTitle, { tag: 'h2' }, label),
        React.createElement(Component)
      )
    );
  }

  async patchSettingsContextMenu () {
    const SettingsContextMenu = await getModule(m => m.default?.displayName === 'UserSettingsCogContextMenu');
    inject('pc-settings-actions', SettingsContextMenu, 'default', (_, res) => {
      const parent = React.createElement(Menu.MenuItem, {
        id: 'powercord-actions',
        label: 'Powercord'
      }, Object.keys(powercord.api.settings.tabs).map(tabId => {
        const props = powercord.api.settings.tabs[tabId];
        const label = typeof props.label === 'function' ? props.label() : props.label;

        return React.createElement(Menu.MenuItem, {
          label,
          id: tabId,
          action: async () => {
            const settingsModule = await getModule([ 'open', 'saveAccountChanges' ]);
            settingsModule.open(tabId);
          }
        });
      }));

      parent.key = 'Powercord';

      const items = res.props.children.find(child => Array.isArray(child));
      const changelog = items.find(item => item?.props?.id === 'changelog');
      if (changelog) {
        items.splice(items.indexOf(changelog), 0, parent);
      } else {
        this.error('Unable to locate "Change Log" item; forcing element to context menu!');
        res.props.children.push(parent);
      }

      return res;
    });
  }
};
