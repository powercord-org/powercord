const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { getOwnerInstance, waitFor, sleep } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName, constants: { Routes } } = require('powercord/webpack');

const webContents = require('electron').remote.getCurrentWindow();

module.exports = class TitleBarGames extends Plugin {
  async startPlugin () {
    if (process.platform !== 'win32') {
      return this.warn('Exiting due to unsupported platform.');
    }

    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.icon = await getModuleByDisplayName('Icon');
    this.iconClass = await getModule([ 'linkButtonIcon' ]);
    this.applications = await getModule([ 'LAUNCHABLE_APPLICATIONS' ]);
    this.navigator = await getModule([ 'transitionTo' ]);
    this.patchTitlebar();
  }

  pluginWillUnload () {
    uninject('pc-titleBarGames');
    const bar = document.querySelector('.pc-games-bar');
    if (bar) {
      bar.remove();
    }
  }

  launchApplication ({ id }) {
    return webContents.send('DISCORD_LAUNCH_APPLICATION', id);
  }

  getApplications () {
    const applications = this.applications
      .LAUNCHABLE_APPLICATIONS() // eslint-disable-line
      .map(({ application }) =>
        React.createElement('div', {
          className: 'pc-game-img',
          onClick: () => this.launchApplication(application),
          style: {
            backgroundImage: `url(https://cdn.discordapp.com/app-icons/${application.id}/${application.icon}.webp?size=256&keep_aspect_ratio=false)`
          }
        })
      );

    applications.push(React.createElement('div', {
      className: `pc-game-img ${this.iconClass.linkButtonIcon}`,
          onClick: () => this.navigator.transitionTo(Routes.APPLICATION_LIBRARY)
      }, [
        React.createElement(this.icon, { name: 'Library' })
    ]));

    return applications.slice(0, 40);
  }

  async patchTitlebar () {
    const _this = this;

    const titleBar = await waitFor('.pc-titleBar');
    const instance = getOwnerInstance(titleBar);

    const DirectTitleBarComponent = instance._reactInternalFiber.child.child.type;
    const TitleBarComponent = class PatchedTitleBarComponent extends React.Component {
      render () {
        const directTitleBar = new DirectTitleBarComponent();

        directTitleBar.props.children.splice(1, 0,
          React.createElement('div', {
            className: 'pc-games-bar'
          }, ..._this.getApplications())
        );

        return directTitleBar;
      }
    };

    inject('pc-titleBarGames', instance, 'render', () =>
      React.createElement(TitleBarComponent)
    );

    // eslint-disable-next-line
    // re-render titlebar after discord updates with games
    // @todo automatic
    await sleep(5000);
    instance.forceUpdate();
  }
};
