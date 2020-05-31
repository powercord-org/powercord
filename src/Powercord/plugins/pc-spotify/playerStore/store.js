const { Flux, FluxDispatcher } = require('powercord/webpack');
const { FluxActions } = require('../constants');

const LibraryState = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  IN_LIBRARY: 'IN_LIBRARY',
  NOT_IN_LIBRARY: 'NOT_IN_LIBRARY',
  LOCAL_SONG: 'LOCAL_SONG'
});

const RepeatState = Object.freeze({
  NO_REPEAT: 'NO_REPEAT',
  REPEAT_TRACK: 'REPEAT_TRACK',
  REPEAT_CONTEXT: 'REPEAT_CONTEXT'
});

let lastActiveDeviceId = null;
let devices = [];
let currentTrack = null;
let currentLibraryState = LibraryState.UNKNOWN;
let playerState = {
  repeat: RepeatState.NO_REPEAT,
  shuffle: false,
  canRepeat: true,
  canRepeatOne: true,
  canShuffle: true,
  spotifyRecordedProgress: 0,
  spotifyRecordedProgressAt: Date.now(),
  playing: false,
  volume: 100
};

function handleDevicesFetched (fetchedDevices) {
  devices = fetchedDevices;
  const activeDevice = devices.find(d => d.is_active);
  if (activeDevice) {
    lastActiveDeviceId = activeDevice.id;
  }
}

function handleCurrentTrackUpdated (track) {
  currentLibraryState = LibraryState.UNKNOWN;
  currentTrack = track;
}

function handlePlayerStateUpdated (state) {
  playerState = state;
}

function handleLibraryStateUpdated (state) {
  currentLibraryState = state;
}

class SpotifyPlayerStore extends Flux.Store {
  get LibraryState () {
    return LibraryState;
  }

  get RepeatState () {
    return RepeatState;
  }

  getStore () {
    return {
      devices,
      currentTrack,
      currentLibraryState,
      playerState
    };
  }

  getDevices () {
    return devices;
  }

  getLastActiveDeviceId () {
    return lastActiveDeviceId;
  }

  getCurrentTrack () {
    return currentTrack;
  }

  getCurrentLibraryState () {
    return currentLibraryState;
  }

  getPlayerState () {
    return playerState;
  }
}

module.exports = new SpotifyPlayerStore(FluxDispatcher, {
  [FluxActions.DEVICES_FETCHED]: ({ devices }) => handleDevicesFetched(devices),
  [FluxActions.CURRENT_TRACK_UPDATED]: ({ track }) => handleCurrentTrackUpdated(track),
  [FluxActions.PLAYER_STATE_UPDATED]: ({ state }) => handlePlayerStateUpdated(state),
  [FluxActions.LIBRARY_STATE_UPDATED]: ({ state }) => handleLibraryStateUpdated(state)
});
