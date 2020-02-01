const { React, constants: { Permissions }, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { Plugin: PluginIcon, Theme } } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { forceUpdateElement } = require('powercord/util');
const { Plugin } = require('powercord/entities');
const { MAGIC_CHANNELS: { STORE_PLUGINS, STORE_THEMES } } = require('powercord/constants');
const { resolve } = require('path');

const layout = require('./components/manage/Layout.jsx');
const Store = require('./components/store/Store');
const Soon = require('./components/Soon.jsx');
const commands = require('./commands');
const i18n = require('./licenses/index');

module.exports = class ModuleManager extends Plugin {
  async startPlugin () {
    powercord.api.i18n.loadAllStrings(i18n);
    this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));

    Object.values(commands).forEach(cmd =>
      this.registerCommand(cmd.command, cmd.aliases || [],
        cmd.description, cmd.usage,
        cmd.func, cmd.autocompleteFunc
      )
    );

    this.registerSettings('pc-moduleManager-plugins', () => Messages.POWERCORD_PLUGINS, layout('plugins', false, this._fetchEntities));
    if (this.settings.get('__experimental_2019-10-25', false)) {
      this.log('Experimental Module Manager enabled.');
      this._injectCommunityContent();
      this.registerSettings('pc-moduleManager-themes', () => Messages.POWERCORD_THEMES, layout('themes', true, this._fetchEntities));

      this.registerRoute('/store/plugins', Store, true);
      this.registerRoute('/store/themes', Store, true);
    } else {
      this.registerSettings('pc-moduleManager-themes', Messages.POWERCORD_THEMES, Soon);
    }
  }

  pluginWillUnload () {
    uninject('pc-moduleManager-channelItem');
    uninject('pc-moduleManager-channelProps');
  }

  async _injectCommunityContent () {
    const { transitionTo } = await getModule([ 'transitionTo' ]);
    const permissionsModule = await getModule([ 'can' ]);
    const ChannelItem = await getModuleByDisplayName('ChannelItem');

    inject('pc-moduleManager-channelItem', permissionsModule, 'can', (args, res) => {
      const id = args[1].channelId || args[1].id;
      if (id === STORE_PLUGINS || id === STORE_THEMES) {
        return args[0] === Permissions.VIEW_CHANNEL;
      }
      return res;
    });

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

  __toggleExperimental () {
    const current = this.settings.get('__experimental_2019-10-25', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental new module manager, that is NOT functional yet.');
      this.warn('WARNING: Powercord Staff won\'t accept bug reports from this experimental version, nor provide support!');
      this.warn('WARNING: Use it at your own risk! It\'s labeled experimental for a reason.');
    } else {
      this.log('Experimental Module Manager disabled.');
    }
    this.settings.set('__experimental_2019-10-25', !current);
    powercord.pluginManager.remount(this.entityID);
  }
};
