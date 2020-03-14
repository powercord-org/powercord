const { getModule, getModuleByDisplayName, messages, constants: discordConsts } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { Plugin } = require('powercord/entities');
const { resolve } = require('path');

const DocsLayer = require('./components/DocsLayer');

module.exports = class Documentation extends Plugin {
  startPlugin () {
    if (this.settings.get('__experimental_2019-10-30', false)) {
      this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));
      this.addDocsItems();
    }
  }

  async pluginWillUnload () {
    uninject('pc-docs-tab');
  }

  async addDocsItems () {
    const { pushLayer } = await getModule([ 'pushLayer' ]);
    const SettingsView = await getModuleByDisplayName('SettingsView');
    inject('pc-docs-tab', SettingsView.prototype, 'getPredicateSections', (args, sections) => {
      const changelog = sections.find(c => c.section === 'changelog');
      if (changelog) {
        sections.splice(
          sections.indexOf(changelog) + 1, 0,
          {
            section: 'pc-documentation',
            onClick: async () => {
              await this._ensureHighlight();
              setImmediate(() => pushLayer(DocsLayer));
            },
            label: 'Powercord Docs'
          }
        );
      }

      return sections;
    });
  }

  async _ensureHighlight () {
    const module = await getModule([ 'highlight' ]);
    if (typeof module.highlight !== 'function') {
      const currentChannel = (await getModule([ 'getChannelId' ])).getChannelId();
      if (!currentChannel) {
        const router = await getModule([ 'replaceWith' ]);
        const channels = await getModule([ 'getChannels' ]);
        const permissions = await getModule([ 'can' ]);
        const currentLocation = window.location.pathname;
        const channel = channels.getChannels().find(c => c.type === 0 && permissions.can(discordConsts.Permissions.VIEW_CHANNEL, c));
        const route = discordConsts.Routes.CHANNEL(channel.guild_id, channel.id); // eslint-disable-line new-cap
        router.replaceWith(route);
        return setImmediate(async () => {
          await this._loadModule(channel.id);
          router.replaceWith(currentLocation);
        });
      }
      await this._loadModule(currentChannel);
    }
  }

  async _loadModule (channel) {
    const module = await getModule([ 'createBotMessage' ]);
    const message = module.createBotMessage(channel, '```js\nconsole.log("yeet")\n```');
    messages.receiveMessage(channel, message);
    messages.deleteMessage(channel, message.id, true);
  }

  __toggleExperimental () {
    const current = this.settings.get('__experimental_2019-10-30', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental documentation, that is NOT functional yet.');
      this.warn('WARNING: Powercord Staff won\'t accept bug reports from this experimental version, nor provide support!');
      this.warn('WARNING: Use it at your own risk! It\'s labeled experimental for a reason.');
    } else {
      this.log('Experimental documentation disabled.');
    }
    this.settings.set('__experimental_2019-10-30', !current);
    powercord.pluginManager.remount(this.entityID);
  }
};
