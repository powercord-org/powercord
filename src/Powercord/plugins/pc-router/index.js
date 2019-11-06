const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getAllModules, getModuleByDisplayName, Router: { Route } } = require('powercord/webpack');
const { findInTree, getOwnerInstance, waitFor } = require('powercord/util');

module.exports = class Router extends Plugin {
  async startPlugin () {
    await this._injectRouter();
    this._listener = this._rerender.bind(this);
    powercord.api.router.addChangeListener(this._listener);
    setImmediate(() => powercord.api.router.restorePrevious());
  }

  pluginWillUnload () {
    powercord.api.router.removeChangeListener(this._listener);
    uninject('pc-router-route');
    uninject('pc-router-router');
  }

  async _injectRouter () {
    const AppView = await getModuleByDisplayName('FluxContainer(AppView)');
    const ViewsWithMainInterface = await getModuleByDisplayName('ViewsWithMainInterface');
    const { container } = await getModule([ 'container', 'downloadProgressCircle' ]);
    const RouteRenderer = getOwnerInstance(await waitFor(`.${container.split(' ')[0]}`));

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
      powercord.api.router.routes.forEach(route => {
        res.props.children[0].props.children[1].push(
          React.createElement(Route, {
            path: `/_powercord${route.path}`,
            render: () => React.createElement(AppView)
          })
        );
      });
      return res;
    });

    this._rerender();
  }

  async _rerender () {
    const { app } = getAllModules([ 'app' ]).find(m => Object.keys(m).length === 1);
    const instance = getOwnerInstance(await waitFor(`.${app.split(' ')[0]}`));
    findInTree(instance._reactInternalFiber, n => n && n.historyUnlisten, { walkable: [ 'child', 'stateNode' ] }).forceUpdate();
  }
};
