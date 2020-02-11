const { getModule } = require('powercord/webpack');
const { API } = require('powercord/entities');

const Lodash = getModule([ 'keyBy' ], false);

module.exports = class Connections extends API {
  constructor () {
    super();

    this.connections = [];
  }

  registerConnection (connection) {
    if (this.get(connection.type)) {
      throw new Error('This type of connection already exists!');
    }
    this.connections.push(connection);
  }

  unregisterConnection (type) {
    this.connections = this.connections.filter(c => c.type !== type);
  }

  get (type) {
    return Lodash.keyBy(this.connections, 'type')[type] || null;
  }

  map (callback) {
    return this.connections.map(callback);
  }

  filter (callback) {
    return this.connections.filter(callback);
  }
};
