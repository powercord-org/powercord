const { React, constants: { Permissions }, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { Plugin: PluginIcon, Theme } } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { forceUpdateElement } = require('powercord/util');
const { Plugin } = require('powercord/entities');
const { MAGIC_CHANNELS: { CSS_SNIPPETS, STORE_PLUGINS, STORE_THEMES } } = require('powercord/constants');
const { resolve } = require('path');

const commands = require('./commands');
const i18n = require('./licenses/index');

const layout = require('./components/manage/LayoutLegacy');
const Store = require('./components/store/Store');
const Soon = require('./components/Soon');
const Plugins = require('./components/manage/Plugins');
const Themes = require('./components/manage/Themes');

module.exports = class ModuleManager extends Plugin {
  async startPlugin () {
    powercord.api.i18n.loadAllStrings(i18n);

    Object.values(commands).forEach(cmd =>
      this.registerCommand(cmd.command, cmd.aliases || [],
        cmd.description, cmd.usage,
        cmd.func, cmd.autocompleteFunc
      )
    );

    powercord.api.labs.registerExperiment({
      id: 'pc-moduleManager-themes',
      name: 'Plugin and Themes settings update',
      date: 1587488341226,
      description: 'Partial plugins UI redesign and new Theme management UI',
      usable: false,
      callback: () => {
        // We're supposed to do it properly but reload > all
        setImmediate(() => powercord.pluginManager.remount(this.entityID));
        // And we wrap it in setImmediate to not break the labs UI
      }
    });

    powercord.api.labs.registerExperiment({
      id: 'pc-moduleManager-store',
      name: 'Powercord Store',
      date: 1571961600000,
      description: 'Powercord Plugin and Theme store',
      usable: false,
      callback: () => {
        // We're supposed to do it properly but reload > all
        setImmediate(() => powercord.pluginManager.remount(this.entityID));
        // And we wrap it in setImmediate to not break the labs UI
      }
    });

    powercord.api.labs.registerExperiment({
      id: 'pc-moduleManager-snippets',
      name: 'Snippet features',
      date: 1587605896724,
      description: 'Stuff for css snippets',
      usable: false,
      callback: () => {
        // We're supposed to do it properly but reload > all
        setImmediate(() => powercord.pluginManager.remount(this.entityID));
        // And we wrap it in setImmediate to not break the labs UI
      }
    });

    if (powercord.api.labs.isExperimentEnabled('pc-moduleManager-snippets')) {
      this._injectSnippets();
    }

    if (powercord.api.labs.isExperimentEnabled('pc-moduleManager-store')) {
      this._injectCommunityContent();
      this.registerRoute('/store/plugins', Store, true);
      this.registerRoute('/store/themes', Store, true);
    }

    if (powercord.api.labs.isExperimentEnabled('pc-moduleManager-themes')) {
      this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));
      this.registerSettings('pc-moduleManager-plugins', () => Messages.POWERCORD_PLUGINS, Plugins);
      this.registerSettings('pc-moduleManager-themes', () => Messages.POWERCORD_THEMES, Themes);
    } else {
      this.loadCSS(resolve(__dirname, 'scss', 'brrrrr', 'style.scss'));
      this.registerSettings('pc-moduleManager-plugins', () => Messages.POWERCORD_PLUGINS, layout('plugins', false, this._fetchEntities));
      this.registerSettings('pc-moduleManager-themes', Messages.POWERCORD_THEMES, Soon);
    }
  }

  pluginWillUnload () {
    powercord.api.labs.unregisterExperiment('pc-moduleManager-store');
    powercord.api.labs.unregisterExperiment('pc-moduleManager-themes');
    uninject('pc-moduleManager-channelItem');
    uninject('pc-moduleManager-channelProps');
  }

  async _injectCommunityContent () {
    const permissionsModule = await getModule([ 'can' ]);
    inject('pc-moduleManager-channelItem', permissionsModule, 'can', (args, res) => {
      const id = args[1].channelId || args[1].id;
      if (id === STORE_PLUGINS || id === STORE_THEMES) {
        return args[0] === Permissions.VIEW_CHANNEL;
      }
      return res;
    });

    const { transitionTo } = await getModule([ 'transitionTo' ]);
    const ChannelItem = await getModuleByDisplayName('ChannelItem');
    inject('pc-moduleManager-channelProps', ChannelItem.prototype, 'render', function (args, res) {
      const data = {
        [STORE_PLUGINS]: {
          icon: PluginIcon,
          name: Messages.POWERCORD_PLUGINS,
          route: '/_powercord/store/plugins'
        },
        [STORE_THEMES]: {
          icon: Theme,
          name: Messages.POWERCORD_THEMES,
          route: '/_powercord/store/themes'
        }
      };

      if (this.props.channel.id === STORE_PLUGINS || this.props.channel.id === STORE_THEMES) {
        res.props.children[1].props.children[1].props.children = data[this.props.channel.id].name;
        res.props.children[1].props.children[0] = React.createElement(data[this.props.channel.id].icon, {
          className: res.props.children[1].props.children[0].props.className,
          width: 24,
          height: 24
        });
        res.props.onClick = () => transitionTo(data[this.props.channel.id].route);
        delete res.props.onMouseDown;
        delete res.props.onContextMenu;
      }
      return res;
    });

    const { containerDefault } = await getModule([ 'containerDefault' ]);
    forceUpdateElement(`.${containerDefault}`, true);
  }

  async _injectSnippets () {
    console.log(CSS_SNIPPETS);
  }

  async _fetchEntities (type) {
    powercord.api.notices.closeToast('missing-entities-notify');

    const entityManager = powercord[type === 'plugins' ? 'pluginManager' : 'styleManager'];
    const missingEntities = await type === 'plugins' ? entityManager.startPlugins(true) : entityManager.loadThemes(true);
    const entity = missingEntities.length === 1 ? type.slice(0, -1) : type;
    const subjectiveEntity = `${entity} ${entity === type ? 'were' : 'was'}`;

    let props;
    if (missingEntities.length > 0) {
      props = {
        header: `Found ${missingEntities.length} missing ${entity}!`,
        content: React.createElement('div', null,
          `The following ${subjectiveEntity} retrieved:`,
          React.createElement('ul', null, missingEntities.map(entity =>
            React.createElement('li', null, `– ${entity}`))
          )
        ),
        buttons: [ {
          text: 'OK',
          color: 'green',
          look: 'outlined'
        } ],
        type: 'success'
      };
    } else {
      props = {
        header: `No missing ${type} were found - try again later!`,
        type: 'danger',
        timeout: 10e3
      };
    }

    powercord.api.notices.sendToast('missing-entities-notify', props);
  }
};
