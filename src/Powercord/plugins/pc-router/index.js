const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getAllModules, getModuleByDisplayName } = require('powercord/webpack');
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
    uninject('pc-router-route-side');
    uninject('pc-router-route');
    uninject('pc-router-router');
  }

  async _injectRouter () {
    const FluxViewsWithMainInterface = await getModuleByDisplayName('FluxContainer(ViewsWithMainInterface)');
    const ViewsWithMainInterface = FluxViewsWithMainInterface
      .prototype.render.call({ memoizedGetStateFromStores: () => ({}) }).type;
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

    inject('pc-router-route-side', RouteRenderer.__proto__, 'render', function (args) {
      const renderer = this.renderChannelSidebar;
      this.renderChannelSidebar = (props) => {
        const rte = powercord.api.router.routes.find(r => r.path === props.location.pathname.slice(11));
        if (rte && rte.noSidebar) {
          return null;
        }
        return renderer.call(this, props);
      };
      return args;
    }, true);

    inject('pc-router-router', ViewsWithMainInterface.prototype, 'render', (args, res) => {
      const routes = findInTree(res, n => (
        Array.isArray(n) && n[0] &&
        n[0].key &&
        n[0].props.path && n[0].props.render
      ));

      routes[routes.length - 1].props.path = [
        ...new Set(routes[routes.length - 1].props.path.concat(powercord.api.router.routes.map(route => `/_powercord${route.path}`)))
      ];
      return res;
    });

    RouteRenderer.forceUpdate();
    this._rerender();
  }

  async _rerender () {
    const { app } = getAllModules([ 'app' ]).find(m => Object.keys(m).length === 1);
    const instance = getOwnerInstance(await waitFor(`.${app.split(' ')[0]}`));
    findInTree(instance._reactInternalFiber, n => n && n.historyUnlisten, { walkable: [ 'child', 'stateNode' ] }).forceUpdate();
  }
};
