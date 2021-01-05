const { FluxDispatcher } = require('powercord/webpack');
const { FluxActions } = require('../constants');
const SpotifyAPI = require('../SpotifyAPI');

function formatTracks (spotifyTracks) {
  return Object.fromEntries(
    spotifyTracks.map(t => [
      t.id || t.uri,
      {
        uri: t.uri,
        name: t.name,
        isLocal: t.is_local,
        duration: t.duration_ms,
        explicit: t.explicit
      }
    ])
  );
}

module.exports = {
  loadSongs: async () => {
    const songs = await SpotifyAPI.getSongs();
    FluxDispatcher.dirtyDispatch({
      type: FluxActions.SONGS_LOADED,
      songs: formatTracks(songs.map(s => s.track))
    });
  },

  loadTopSongs: async () => {
    const topSongs = await SpotifyAPI.getTopSongs();
    FluxDispatcher.dirtyDispatch({
      type: FluxActions.TOP_SONGS_LOADED,
      topSongs: formatTracks(topSongs.items)
    });
  },

  loadAlbums: async () => {
    const albums = await SpotifyAPI.getAlbums();
    FluxDispatcher.dirtyDispatch({
      type: FluxActions.ALBUMS_LOADED,
      albums: Object.fromEntries(
        albums.map(({ album }) => [
          album.id,
          {
            uri: album.uri,
            name: album.name,
            tracks: formatTracks(album.tracks.items),
            tracksLoaded: !album.tracks.next
          }
        ])
      )
    });

    albums.filter(({ album: { tracks: { next } } }) => !next).forEach(async ({ album: { id, tracks } }) => {
      const albumTracks = await SpotifyAPI.getAlbumTracks(id, tracks.limit, tracks.limit);
      FluxDispatcher.dirtyDispatch({
        type: FluxActions.ALBUM_TRACKS_LOADED,
        albumId: id,
        tracks: formatTracks(tracks.items.concat(albumTracks))
      });
    });
  },

  loadPlaylists: async () => {
    const playlists = await SpotifyAPI.getPlaylists();
    FluxDispatcher.dirtyDispatch({
      type: FluxActions.PLAYLISTS_LOADED,
      playlists: Object.fromEntries(
        playlists.map(playlist => [
          playlist.id,
          {
            uri: playlist.uri,
            name: playlist.name,
            icon: playlist.images[0] ? playlist.images[0].url : null,
            editable: playlist.owner.display_name === powercord.account.accounts.spotify || playlist.collaborative,
            tracksLoaded: false
          }
        ])
      )
    });

    playlists.forEach(async ({ id }) => {
      const playlistTracks = await SpotifyAPI.getPlaylistTracks(id);
      FluxDispatcher.dirtyDispatch({
        type: FluxActions.PLAYLIST_TRACKS_LOADED,
        playlistId: id,
        tracks: formatTracks(playlistTracks.map(pt => pt.track))
      });
    });
  },

  addTrack: async (playlistId, trackId) => {
    const track = await SpotifyAPI.getTrack(trackId);
    FluxDispatcher.dirtyDispatch({
      type: FluxActions.PLAYLIST_TRACK_ADDED,
      playlistId,
      trackId,
      trackDetails: {
        name: track.name,
        duration: track.duration_ms,
        explicit: track.explicit
      }
    });
  },

  deleteTrack: (playlistId, trackId) => {
    FluxDispatcher.dirtyDispatch({
      type: FluxActions.PLAYLIST_TRACK_REMOVED,
      playlistId,
      trackId
    });
  },

  purgeSongs: () => FluxDispatcher.dirtyDispatch({ type: FluxActions.PURGE_SONGS })
};
