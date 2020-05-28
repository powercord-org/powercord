const { API } = require('powercord/entities');
const { WEBSITE } = require('powercord/constants');
const { put } = require('powercord/http');

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

  // @todo: Move this to the plugin?
  async setVisibility (type, value) {
    if (!powercord.account) {
      return;
    }

    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    await put(`${baseUrl}/api/v2/users/@me/accounts/${type}`)
      .set('Authorization', powercord.account.token)
      .set('Content-Type', 'application/json')
      .send({ visibility: value });
  }

  get (type) {
    const connections = {};
    for (const element of this.connections) {
      connections[element.type] = element;
    }

    return connections[type] || null;
  }
};
