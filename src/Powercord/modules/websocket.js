module.exports = () =>
  window.WebSocket = class PatchedWebSocket extends window.WebSocket {
    constructor (url) {
      super(url);

      this.addEventListener('message', (data) => {
        powercord.emit(`webSocketMessage:${data.origin.slice(6)}`, data);
      });
    }
  };
