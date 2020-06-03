const { API } = require('powercord/entities');

module.exports = class ConnectionsAPI extends API {
  constructor () {
    super();

    this.connections = [];
  }

  get map () {
    return this.connections.map.bind(this.connections);
  }

  get filter () {
    return this.connections.filter.bind(this.connections);
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

  fetchAccounts (id) {
    return Promise.all(
      this.filter(c => c.enabled).map(c => c.fetchAccount(id))
    );
  }

  get (type) {
    const connections = {};
    for (const element of this.connections) {
      connections[element.type] = element;
    }

    return connections[type] || null;
  }
};
