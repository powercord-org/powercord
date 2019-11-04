const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { Toast } = require('powercord/components');

module.exports = class Toasts extends Plugin {
  async startPlugin () {
    this.classes = {
      ...await getModule([ 'app' ])
    };

    this._patchToasts();
  }

  pluginWillUnload () {
    uninject('pc-toasts-render');
  }

  async _patchToasts () {
    const instance = getOwnerInstance(await waitFor(`.${this.classes.app.split(' ')[0]}`));
    inject('pc-toasts-render', instance.__proto__, 'render', (_, res) => {
      const ToastContainer = React.createElement('div', {
        className: 'powercord-toastsContainer'
      }, this._renderToasts());

      const toastContainer = res.props.children.find(child => child.props && child.props.className === 'powercord-toastsContainer');
      if (toastContainer) {
        toastContainer.props.children = this._renderToasts();
      } else {
        res.props.children.push(ToastContainer);
      }

      return res;
    });

    instance.forceUpdate();
  }

  _renderToasts () {
    const { toasts } = powercord.api.toasts;
    const children = [];

    if (toasts.length > 0) {
      for (const toast of toasts) {
        children.push(React.createElement(Toast, {
          ...toast
        }));
      }
    }

    return children[children.length - 1];
  }
};
