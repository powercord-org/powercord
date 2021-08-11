const { WEBSITE } = require('powercord/constants');
const { shell: { openExternal } } = require('electron');
const { get, put, post, del } = require('powercord/http');
const { getModule, http, spotify, constants: { Endpoints } } = require('powercord/webpack');
const { SPOTIFY_BASE_URL, SPOTIFY_PLAYER_URL } = require('./constants');
const playerStore = require('./playerStore/store');

const revokedMessages = {
  SCOPES_UPDATED: 'Your Spotify account needs to be relinked to your Powercord account due to new authorizations required.',
  ACCESS_DENIED: 'Powercord is no longer able to connect to your Spotify account. Therefore, it has been automatically unlinked.'
};

let usedCached = false;

module.exports = {
  accessToken: null,

  async getAccessToken () {
    if (!powercord.account) {
      await powercord.fetchAccount();
    }

    if (powercord.account && powercord.account.accounts.spotify) {
      const baseUrl = powercord.settings.get('backendURL', WEBSITE);
      const resp = await get(`${baseUrl}/api/v2/users/@me/spotify`)
        .set('Authorization', powercord.account.token)
        .then(r => r.body);

      if (resp.revoked) {
        powercord.api.notices.sendAnnouncement('spotify-revoked', {
          color: 'orange',
          message: revokedMessages[resp.revoked],
          button: {
            text: 'Relink Spotify',
            onClick: () => openExternal(`${baseUrl}/api/v2/oauth/spotify`)
          }
        });
      } else if (resp.token) {
        return resp.token;
      }
    }

    console.debug('%c[SpotifyAPI]', 'color: #1ed860', 'No Spotify account linked to Powercord; Falling back to Discord\'s token');
    if (!usedCached) {
      const spotifyMdl = await getModule([ 'getActiveSocketAndDevice' ]);
      const active = spotifyMdl.getActiveSocketAndDevice();
      if (active && active.socket && active.socket.accessToken) {
        usedCached = true;
        return active.socket.accessToken;
      }
    }

    usedCached = false;
    const spotifyUserID = await http.get(Endpoints.CONNECTIONS)
      .then(res =>
        res.body.find(connection =>
          connection.type === 'spotify'
        ).id
      );

    return spotify.getAccessToken(spotifyUserID)
      .then(r => r.body.access_token);
  },

  genericRequest (request, isConnectWeb) {
    request.set('Authorization', `Bearer ${this.accessToken}`);
    if (isConnectWeb) {
      const currentDeviceId = playerStore.getLastActiveDeviceId();
      if (currentDeviceId) {
        request.query('device_id', currentDeviceId);
      }
    }
    return request
      .catch(async (err) => {
        if (err) {
          if (err.statusCode === 401) {
            this.accessToken = await this.getAccessToken();
            delete request._res;
            return this.genericRequest(request);
          }
          console.error(err.body, request.opts);
          throw err;
        }
      });
  },

  getTrack (trackId) {
    return this.genericRequest(
      get(`${SPOTIFY_BASE_URL}/tracks/${trackId}`)
    ).then(r => r.body);
  },

  getPlaylists (limit = 50, offset = 0) {
    return this._fetchAll(`${SPOTIFY_BASE_URL}/me/playlists`, limit, offset);
  },

  getPlaylistTracks (playlistId, limit = 100, offset = 0) {
    return this._fetchAll(`${SPOTIFY_BASE_URL}/playlists/${playlistId}/tracks`, limit, offset);
  },

  addToPlaylist (playlistID, songURI) {
    return this.genericRequest(
      post(`${SPOTIFY_BASE_URL}/playlists/${playlistID}/tracks`)
        .query('uris', songURI)
    ).then(r => r.body);
  },

  getAlbums (limit = 50, offset = 0) {
    return this._fetchAll(`${SPOTIFY_BASE_URL}/me/albums`, limit, offset);
  },

  getAlbumTracks (albumId, limit = 100, offset = 0) {
    return this._fetchAll(`${SPOTIFY_BASE_URL}/albums/${albumId}/tracks`, limit, offset);
  },

  getTopSongs () {
    return this.genericRequest(
      get(`${SPOTIFY_BASE_URL}/me/top/tracks`)
        .query('limit', 50)
    ).then(r => r.body);
  },

  getSongs (limit = 50, offset = 0) {
    return this._fetchAll(`${SPOTIFY_BASE_URL}/me/tracks`, limit, offset);
  },

  search (query, type = 'track', limit = 20) {
    return this.genericRequest(
      get(`${SPOTIFY_BASE_URL}/search`)
        .query('q', query)
        .query('type', type)
        .query('limit', limit)
    ).then(r => r.body);
  },

  play (data) {
    return this.genericRequest(
      put(`${SPOTIFY_PLAYER_URL}/play`).send(data), true
    );
  },

  pause () {
    return this.genericRequest(
      put(`${SPOTIFY_PLAYER_URL}/pause`), true
    );
  },

  seek (position) {
    return this.genericRequest(
      put(`${SPOTIFY_PLAYER_URL}/seek`).query('position_ms', position), true
    );
  },

  next () {
    return this.genericRequest(
      post(`${SPOTIFY_PLAYER_URL}/next`), true
    );
  },

  prev () {
    return this.genericRequest(
      post(`${SPOTIFY_PLAYER_URL}/previous`), true
    );
  },

  getPlayer () {
    return this.genericRequest(
      get(SPOTIFY_PLAYER_URL)
    ).then(r => r.body);
  },

  getDevices () {
    return this.genericRequest(
      get(`${SPOTIFY_PLAYER_URL}/devices`)
    ).then(r => r.body);
  },

  setVolume (volume) {
    return this.genericRequest(
      put(`${SPOTIFY_PLAYER_URL}/volume`).query('volume_percent', volume), true
    );
  },

  setActiveDevice (deviceID) {
    return this.genericRequest(
      put(SPOTIFY_PLAYER_URL)
        .send({
          device_ids: [ deviceID ],
          play: true
        })
    );
  },

  setRepeatState (state) {
    return this.genericRequest(
      put(`${SPOTIFY_PLAYER_URL}/repeat`).query('state', state), true
    );
  },

  setShuffleState (state) {
    return this.genericRequest(
      put(`${SPOTIFY_PLAYER_URL}/shuffle`).query('state', state), true
    );
  },

  addSong (songID) {
    return this.genericRequest(
      put(`${SPOTIFY_BASE_URL}/me/tracks`)
        .query('ids', songID)
    );
  },

  removeSong (songID) {
    return this.genericRequest(
      del(`${SPOTIFY_BASE_URL}/me/tracks`)
        .query('ids', songID)
    );
  },

  checkLibrary (songID) {
    return this.genericRequest(
      get(`${SPOTIFY_BASE_URL}/me/tracks/contains`)
        .query('ids', songID)
    );
  },

  async _fetchAll (url, limit, offset) {
    const items = [];
    while (url) {
      const req = get(url);
      if (limit) {
        req.query('limit', limit);
        limit = 0;
      }
      if (offset) {
        req.query('offset', offset);
        offset = 0;
      }
      const res = await this.genericRequest(req).then(r => r.body);
      items.push(...res.items);
      url = res.next;
    }
    return items;
  }
};
