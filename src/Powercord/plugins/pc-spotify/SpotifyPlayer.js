const { WEBSITE } = require('powercord/constants');
const { shell: { openExternal } } = require('electron');
const { get, put, post, del } = require('powercord/http');
const { http, spotify, constants: { Endpoints } } = require('powercord/webpack');

const revokedMessages = {
  SCOPES_UPDATED: 'Your Spotify account needs to be relinked to your Powercord account due to new authorizations required.',
  ACCESS_DENIED: 'Powercord is no longer able to connect to your Spotify account. Therefore, it has been automatically unlinked.'
};

module.exports = {
  BASE_URL: 'https://api.spotify.com/v1',
  BASE_PLAYER_URL: 'https://api.spotify.com/v1/me/player',
  accessToken: null,
  player: null,

  async getAccessToken () {
    if (!powercord.account) {
      await powercord.fetchAccount();
    }

    if (powercord.account && powercord.account.spotify) {
      const baseUrl = powercord.settings.get('backendURL', WEBSITE);
      const resp = await get(`${baseUrl}/api/users/@me/spotify`)
        .set('Authorization', powercord.account.token)
        .then(r => r.body);

      if (resp.revoked) {
        const announcements = powercord.pluginManager.get('pc-announcements');
        announcements.sendNotice({
          id: 'pc-spotify-revoked',
          type: announcements.Notice.TYPES.ORANGE,
          message: revokedMessages[resp.revoked],
          button: {
            text: 'Link back Spotify',
            onClick: () => openExternal(`${baseUrl}/oauth/spotify`)
          },
          alwaysDisplay: true
        });
      } else if (resp.token) {
        return resp.token;
      }
    }

    console.debug('%c[Powercord:Spotify]', 'color: #257dd4', 'No Spotify account linked to Powercord; Falling back to Discord\'s token');
    const spotifyUserID = await http.get(Endpoints.CONNECTIONS)
      .then(res =>
        res.body.find(connection =>
          connection.type === 'spotify'
        ).id
      );

    return spotify.getAccessToken(spotifyUserID)
      .then(r => r.body.access_token);
  },

  genericRequest (request) {
    request.set('Authorization', `Bearer ${this.accessToken}`);

    return request
      .catch(async (err) => {
        if (err) {
          if (err.statusCode === 401) {
            this.accessToken = await this.getAccessToken();

            delete request._res;
            return this.genericRequest(request);
          }

          if (err.body && err.body.error && err.body.error.reason === 'PREMIUM_REQUIRED') {
            powercord.pluginManager.get('pc-spotify').openPremiumDialog();
            return false;
          }
          console.error(err.body, request.opts);
          throw err;
        }
      });
  },

  getPlaylists () {
    return this.genericRequest(
      get(`${this.BASE_URL}/me/playlists`)
        .query('limit', 50)
    ).then(r => r.body);
  },

  addToPlaylist (playlistID, songURI) {
    return this.genericRequest(
      post(`${this.BASE_URL}/playlists/${playlistID}/tracks`)
        .query('uris', songURI)
    ).then(r => r.body);
  },

  getAlbums () {
    return this.genericRequest(
      get(`${this.BASE_URL}/me/albums`)
        .query('limit', 50)
    ).then(r => r.body);
  },

  getTopSongs () {
    return this.genericRequest(
      get(`${this.BASE_URL}/me/top/tracks`)
        .query('limit', 50)
    ).then(r => r.body);
  },

  getSongs () {
    return this.genericRequest(
      get(`${this.BASE_URL}/me/tracks`)
        .query('limit', 50)
    ).then(r => r.body);
  },

  play (data) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/play`)
        .send(data)
    );
  },

  pause () {
    return this.genericRequest(put(`${this.BASE_PLAYER_URL}/pause`));
  },

  seek (position) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/seek`)
        .query('position_ms', position)
    );
  },

  next () {
    return this.genericRequest(post(`${this.BASE_PLAYER_URL}/next`));
  },

  prev () {
    return this.genericRequest(post(`${this.BASE_PLAYER_URL}/previous`));
  },

  getPlayer () {
    return this.genericRequest(get(this.BASE_PLAYER_URL))
      .then(r => r.body);
  },

  getDevices () {
    return this.genericRequest(get(`${this.BASE_PLAYER_URL}/devices`))
      .then(r => r.body);
  },

  setVolume (volume) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/volume`)
        .query('volume_percent', volume)
    );
  },

  setActiveDevice (deviceID) {
    return this.genericRequest(
      put(this.BASE_PLAYER_URL)
        .send({
          device_ids: [ deviceID ],
          play: true
        })
    );
  },

  setRepeatState (state) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/repeat`)
        .query('state', state)
    );
  },

  setShuffleState (state) {
    return this.genericRequest(
      put(`${this.BASE_PLAYER_URL}/shuffle`)
        .query('state', state)
    );
  },

  addSong (songID) {
    return this.genericRequest(
      put(`${this.BASE_URL}/me/tracks`)
        .query('ids', songID)
    );
  },

  removeSong (songID) {
    return this.genericRequest(
      del(`${this.BASE_URL}/me/tracks`)
        .query('ids', songID)
    );
  },

  checkLibrary (songID) {
    return this.genericRequest(
      get(`${this.BASE_URL}/me/tracks/contains`)
        .query('ids', songID)
    );
  }
};
