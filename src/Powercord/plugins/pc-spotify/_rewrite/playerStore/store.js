const { Flux, FluxDispatcher } = require('powercord/webpack');

const devices = [];
const currentTrack = {};

class SpotifyPlayerStore extends Flux.Store {
  getDevices () {
    return devices;
  }

  getCurrentTrack () {
    return currentTrack;
  }
}

module.exports = new SpotifyPlayerStore(FluxDispatcher, {});
