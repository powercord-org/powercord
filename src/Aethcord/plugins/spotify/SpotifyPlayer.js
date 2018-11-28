const { get, put, post } = require('ac/http');
const { spotify } = require('ac/webpack');

module.exports = {
  BASE_URL: 'https://api.spotify.com/v1/me/player',
  accessToken: '',

  genericRequest (request) {
    request.set('Authorization', `Bearer ${this.accessToken}`);

    return request
      .catch(async (err) => {
        if (err.statusCode === 401) {
          this.accessToken = await spotify.getAccessToken();
          return this.genericRequest(request);
        }

        throw err;
      });
  },

  pause () {
    return this.genericRequest(put(`${this.BASE_URL}/pause`));
  },

  resume () {
    return this.genericRequest(put(`${this.BASE_URL}/play`));
  },

  next () {
    return this.genericRequest(post(`${this.BASE_URL}/next`));
  },

  prev () {
    return this.genericRequest(post(`${this.BASE_URL}/previous`));
  },

  getPlayer () {
    return this.genericRequest(get(this.BASE_URL))
      .then(r => r.body);
  },

  getDevices () {
    return this.genericRequest(get(`${this.BASE_URL}/devices`))
      .then(r => r.body);
  },

  setVolume (volume) {
    return this.genericRequest(
      put(`${this.BASE_URL}/volume`)
        .query('volume_percent', volume)
    );
  },

  setActiveDevice (deviceID) {
    return this.genericRequest(
      put(this.BASE_URL)
        .send({
          device_ids: [ deviceID ],
          play: true
        })
    );
  }
};

spotify.getAccessToken()
  .then(token => (
    module.exports.accessToken = token
  ));
