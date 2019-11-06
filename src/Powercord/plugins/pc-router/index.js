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
      const { props: { children } } = findInTree(res, n => (
        n && n.type && n.type.name === 't' &&
        n.props && n.props.children
      ));

      children.push(
        ...powercord.api.router.routes.map(route => ({
          ...children[0],
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
      const routes = findInTree(res, n => (
        Array.isArray(n) && n[0] &&
        n[0].key &&
        n[0].props.path && n[0].props.render
      ));

      powercord.api.router.routes.forEach(route => {
        routes.push(
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
