const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModuleByDisplayName } = require('powercord/webpack');
const { getOwnerInstance, waitFor } = require('powercord/util');

module.exports = class Router extends Plugin {
  startPlugin () {
    this._injectRouter();
  }

  pluginWillUnload () {
    uninject('pc-router-route');
    uninject('pc-router-router');
  }

  async _injectRouter () {
    const ViewsWithMainInterface = await getModuleByDisplayName('ViewsWithMainInterface');
    // @todo: dynamic
    const RouteRenderer = getOwnerInstance(await waitFor('.container-2lgZY8'));

    inject('pc-router-route', RouteRenderer.__proto__, 'render', (args, res) => {
      res.props.children[1].props.children[2].props.children[1].props.children.push(
        ...powercord.api.router.routes.map(route => ({
          ...res.props.children[1].props.children[2].props.children[1].props.children[0],
          props: {
            // @todo: Error boundary
            render: () => React.createElement(route.render),
            path: `/_powercord${route.path}`
          }
        }))
      );
      return res;
    });

    inject('pc-router-router', ViewsWithMainInterface.prototype, 'render', (args, res) => {
      // @todo: sidebar or not
      res.props.children[0].props.children[1][7].props.path.push(
        ...powercord.api.router.routes.map(route => `/_powercord${route.path}`)
      );
      return res;
    });

    // i'm proud of this shit ok - @todo: dynamic
    getOwnerInstance(await waitFor('.app-19_DXt'))._reactInternalFiber.child.child.child.child.child.child.child.child.child.child.child.child.stateNode.forceUpdate();
  }
};
