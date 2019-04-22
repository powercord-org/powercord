const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModuleByDisplayName } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');

module.exports = class Router extends Plugin {
  startPlugin () {
    this._injectRouter();
    forceUpdateElement('.pc-layers');
  }

  pluginWillUnload () {
    uninject('pc-router-route');
    uninject('pc-router-router');
  }

  async _injectRouter () {
    const ViewsWithMainInterface = await getModuleByDisplayName('ViewsWithMainInterface');
    const RouteRenderer = getOwnerInstance(await waitFor('.pc-layer > .pc-container'));

    inject('pc-router-route', RouteRenderer.__proto__, 'render', (args, res) => {
      const gayIndex = [ ...res.props.children[1].props.children ].length - 1;
      res.props.children[1].props.children[gayIndex].props.children[1].props.children.push(
        ...powercord.api.router.routes.map(route => ({
          ...res.props.children[1].props.children[gayIndex].props.children[1].props.children[0],
          props: {
            render: () => React.createElement(route.render),
            path: `/_powercord${route.path}`
          }
        }))
      );
      return res;
    });

    inject('pc-router-router', ViewsWithMainInterface.prototype, 'render', (args, res) => {
      res.props.children[0].props.children[1].push(
        ...powercord.api.router.routes.map(route => ({
          ...res.props.children[0].props.children[1][0],
          key: `/_powercord${route.path}`,
          props: {
            path: `/_powercord${route.path}`,
            render: (r) => res.props.children[0].props.children[1][5].props.render(r)
          }
        }))
      );
      return res;
    });
  }
};
