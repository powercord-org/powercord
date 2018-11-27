const { get, put, post } = require('ac/http');

module.exports = {
  BASE_URL: 'https://api.spotify.com/v1/me/player',

  pause (accessToken) {
    return put(`${this.BASE_URL}/pause`)
      .set('Authorization', `Bearer ${accessToken}`);
  },

  resume (accessToken) {
    return put(`${this.BASE_URL}/play`)
      .set('Authorization', `Bearer ${accessToken}`);
  },

  next (accessToken) {
    return post(`${this.BASE_URL}/next`)
      .set('Authorization', `Bearer ${accessToken}`);
  },

  prev (accessToken) {
    return post(`${this.BASE_URL}/previous`)
      .set('Authorization', `Bearer ${accessToken}`);
  },

  getPlayer (accessToken) {
    return get(this.BASE_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .then(r => r.body);
  },

  getDevices (accessToken) {
    return get(`${this.BASE_URL}/devices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .then(r => r.body);
  },

  setVolume (accessToken, volume) {
    return put(`${this.BASE_URL}/volume`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query('volume_percent', volume);
  },

  setActiveDevice (accessToken, deviceID) {
    return put(this.BASE_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        device_ids: [ deviceID ],
        play: true
      });
  }
};