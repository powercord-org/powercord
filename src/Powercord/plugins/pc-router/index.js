const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getAllModules, getModuleByDisplayName } = require('powercord/webpack');
const { getOwnerInstance, waitFor } = require('powercord/util');

module.exports = class Router extends Plugin {
  async startPlugin () {
    await this._injectRouter();
    this._listener = this._rerender.bind(this);
    powercord.api.router.addChangeListener(this._listener);
    const route = powercord.initial_location.searchParams.get('_powercord_route');
    if (route) {
      setImmediate(async () => {
        const router = await getModule([ 'replaceWith' ]);
        router.replaceWith(route);
      });
    }
  }

  pluginWillUnload () {
    powercord.api.router.removeChangeListener(this._listener);
    uninject('pc-router-route');
    uninject('pc-router-router');
  }

  async _injectRouter () {
    const ViewsWithMainInterface = await getModuleByDisplayName('ViewsWithMainInterface');
    const { container } = await getModule([ 'container', 'downloadProgressCircle' ]);
    const RouteRenderer = getOwnerInstance(await waitFor(`.${container.replace(/ /g, '.')}`));

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
      // @todo: let plugins chose if sidebar or not
      res.props.children[0].props.children[1][7].props.path.push(
        ...powercord.api.router.routes.map(route => `/_powercord${route.path}`)
      );
      return res;
    });

    this._rerender();
  }

  async _rerender () {
    const { app } = getAllModules([ 'app' ]).find(m => Object.keys(m).length === 1);
    // i'm proud of this shit ok
    getOwnerInstance(await waitFor(`.${app.replace(/ /g, '.')}`))
      ._reactInternalFiber.child.child.child.child.child.child.child.child.child.child.child.child
      .stateNode.forceUpdate();
  }
};
