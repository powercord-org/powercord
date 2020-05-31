const { Flux, FluxDispatcher } = require('powercord/webpack');
const { FluxActions } = require('../constants');

let songsLoaded = false;
let topSongsLoaded = false;
let albumsLoaded = false;
let playlistsLoaded = false;

let songs = {};
let topSongs = {};
let albums = {};
let playlists = {};

function handleTopSongsLoaded (topSongsData) {
  topSongsLoaded = true;
  topSongs = topSongsData;
}

function handleSongsLoaded (songsData) {
  songsLoaded = true;
  songs = songsData;
}

function handleAlbumsLoaded (albumsData) {
  albumsLoaded = true;
  albums = albumsData;
}

function handleAlbumTracksLoaded (albumId, tracks) {
  albums = {
    ...albums,
    [albumId]: {
      ...albums[albumId],
      tracksLoaded: true,
      tracks
    }
  };
}

function handlePlaylistsLoaded (playlistsData) {
  playlistsLoaded = true;
  playlists = playlistsData;
}

function handlePlaylistTracksLoaded (playlistId, tracks) {
  playlists = {
    ...playlists,
    [playlistId]: {
      ...playlists[playlistId],
      tracksLoaded: true,
      tracks
    }
  };
}

function handlePlaylistTrackAdded (playlistId, trackId, trackDetails) {
  if (playlists[playlistId]) { // If the playlist doesn't exist it means it hasn't been loaded; Let's skip the event
    playlists = {
      ...playlists,
      [playlistId]: {
        ...playlists[playlistId],
        tracks: {
          ...playlists[playlistId].tracks,
          [trackId]: trackDetails
        }
      }
    };
  }
}

function handlePlaylistTrackRemoved (playlistId, trackId) {
  if (playlists[playlistId]) { // If the playlist doesn't exist it means it hasn't been loaded; Let's skip the event
    delete playlists[playlistId].tracks[trackId];
    playlists = global._.cloneDeep(playlists);
  }
}

function handlePurgeSongs () {
  songsLoaded = false;
  topSongsLoaded = false;
  albumsLoaded = false;
  playlistsLoaded = false;
  songs = {};
  topSongs = {};
  albums = {};
  playlists = {};
}

class SpotifyPlaylistsStore extends Flux.Store {
  getStore () {
    return {
      songsLoaded,
      topSongsLoaded,
      albumsLoaded,
      playlistsLoaded,
      songs,
      topSongs,
      albums,
      playlists
    };
  }

  getSongsLoaded () {
    return songsLoaded;
  }

  getSongs () {
    return songs;
  }

  getTopSongsLoaded () {
    return topSongsLoaded;
  }

  getTopSongs () {
    return topSongs;
  }

  getPlaylistsLoaded () {
    return playlistsLoaded;
  }

  getPlaylists () {
    return playlists;
  }

  getPlaylist (playlistId) {
    return playlists[playlistId];
  }

  isInPlaylist (playlistId, trackId) {
    if (!playlists[playlistId]) {
      return false;
    }
    return Object.keys(playlists[playlistId].tracks).includes(trackId);
  }

  getAlbumsLoaded () {
    return albumsLoaded;
  }

  getAlbumbs () {
    return albums;
  }

  getAlbum (albumId) {
    return albums[albumId];
  }
}

module.exports = new SpotifyPlaylistsStore(FluxDispatcher, {
  [FluxActions.SONGS_LOADED]: ({ songs }) => handleSongsLoaded(songs),
  [FluxActions.TOP_SONGS_LOADED]: ({ topSongs }) => handleTopSongsLoaded(topSongs),
  [FluxActions.ALBUMS_LOADED]: ({ albums }) => handleAlbumsLoaded(albums),
  [FluxActions.ALBUM_TRACKS_LOADED]: ({ albumId, tracks }) => handleAlbumTracksLoaded(albumId, tracks),
  [FluxActions.PLAYLISTS_LOADED]: ({ playlists }) => handlePlaylistsLoaded(playlists),
  [FluxActions.PLAYLIST_TRACKS_LOADED]: ({ playlistId, tracks }) => handlePlaylistTracksLoaded(playlistId, tracks),
  [FluxActions.PLAYLIST_TRACK_ADDED]: ({ playlistId, trackId, trackDetails }) => handlePlaylistTrackAdded(playlistId, trackId, trackDetails),
  [FluxActions.PLAYLIST_TRACK_REMOVED]: ({ playlistId, trackId }) => handlePlaylistTrackRemoved(playlistId, trackId),
  [FluxActions.PURGE_SONGS]: () => handlePurgeSongs()
});
