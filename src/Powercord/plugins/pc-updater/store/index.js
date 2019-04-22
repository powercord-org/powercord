const { Flux, FluxDispatcher } = require('powercord/webpack');
const reducer = require('./reducer');

class UpdaterStore extends Flux.Store {
  constructor (dispatcher, reducer) {
    super(dispatcher, {});
    this._actionHandlers = reducer.call(this);

    this.awaitReload = false;
    this.installing = null;
    this.updates = [];
  }
}

const store = new UpdaterStore(FluxDispatcher, reducer);
module.exports = store;
