const { get, put, post } = require('ac/http');
const { spotify } = require('ac/webpack');

module.exports = {
  BASE_URL: 'https://api.spotify.com/v1',
  BASE_PLAYER_URL: 'https://api.spotify.com/v1/me/player',
  accessToken: null,

  genericRequest (request) {
    request.set('Authorization', `Bearer ${this.accessToken}`);

    return request
      .catch(async (err) => {
        if (err.statusCode === 401) {
          this.accessToken = await spotify.getAccessToken();

          delete request._res;
          return this.genericRequest(request);
        }

        console.error(err.body, request.opts);
        throw err;
      });
  },

  getPlaylists () {
    return this.genericRequest(get(`${this.BASE_URL}/me/playlists`))
      .then(r => r.body);
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

  getAlbums () {
    return this.genericRequest(get(`${this.BASE_URL}/me/albums`))
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
  }
};
