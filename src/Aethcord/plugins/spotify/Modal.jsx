const { React, contextMenu, messages, channels } = require('ac/webpack');
const { ContextMenu } = require('ac/components');
const { concat } = require('ac/util');
const { clipboard } = require('electron');
const SpotifyPlayer = require('./SpotifyPlayer.js');

module.exports = class Modal extends React.Component {
  constructor () {
    super();

    this.state = {
      currentItem: {
        name: '',
        artists: [ '' ],
        img: '',
        url: ''
      },
      isPlaying: true,
      volume: 0,
      deviceID: ''
    };
  }

  updateData (playerState) {
    return this.setState({
      currentItem: {
        name: playerState.item.name,
        artists: playerState.item.artists.map(artist => artist.name),
        img: playerState.item.album.images[0].url,
        url: playerState.item.external_urls.spotify
      },
      isPlaying: playerState.is_playing,
      volume: playerState.device.volume_percent,
      deviceID: playerState.device.id
    });
  }

  async componentDidMount () {
    this.props.main.on('event', (data) => {
      if (data.type === 'PLAYER_STATE_CHANGED') {
        this.updateData(data.event.state);
      }
    });

    return this.updateData(
      await SpotifyPlayer.getPlayer()
    );
  }

  onButtonClick (method, ...args) {
    return SpotifyPlayer[method](...args)
      .then(() => true)
  }

  render () {
    const { currentItem, isPlaying } = this.state;
    const artists = concat(currentItem.artists);

    return (
      <div className='container-2Thooq' onContextMenu={this.injectContextMenu.bind(this)}>
        <div
          className='wrapper-2F3Zv8 small-5Os1Bb avatar-small'
          style={{ backgroundImage: `url("${currentItem.img}")` }}
        />
        <div className='accountDetails-3k9g4n nameTag-m8r81H'>
          <span class="username">{currentItem.name}</span>
          <span class="discriminator">{artists ? `by ${artists}` : ''}</span>
        </div>

        <div className='flex-11O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6'>
          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-backward'
            onClick={() => this.onButtonClick('prev')}
          />

          <button
            style={{ color: '#1ed860' }}
            className={`iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-${isPlaying ? 'pause' : 'play'}`}
            onClick={() => this.onButtonClick(isPlaying ? 'pause' : 'play')}
          />

          <button
            style={{ color: '#1ed860' }}
            className='iconButtonDefault-2cKx7- iconButton-3V4WS5 button-2b6hmh small--aHOfS fas fa-forward'
            onClick={() => this.onButtonClick('next')}
          />
        </div>
      </div>
    );
  }

  async injectContextMenu (event) {
    const { pageX, pageY } = event;

    contextMenu.openContextMenu(event, () =>
      React.createElement(ContextMenu, {
        pageX, pageY,
        itemGroups: [
          [{
            type: 'submenu',
            name: 'Devices',
            getItems: () => SpotifyPlayer.getDevices()
              .then(({ devices }) =>
                devices.map(device => ({
                  type: 'button',
                  name: device.name,
                  hint: device.type,
                  highlight: device.id === this.state.deviceID && '#1ed860',
                  disabled: device.id === this.state.deviceID,
                  onClick: () => this.onButtonClick('setActiveDevice', device.id)
                }))
              )
          }],

          [{
            type: 'submenu',
            name: 'Playlists',
            getItems: () => SpotifyPlayer.getPlaylists()
              .then(({ items }) =>
                items.map(playlist => ({
                  type: 'button',
                  name: playlist.name,
                  hint: `${playlist.tracks.total} tracks`,
                  onClick: () => this.onButtonClick('play', {
                    context_uri: playlist.uri
                  })
                }))
              )
          }],

          [{
            type: 'button',
            name: 'Send URL to channel',
            onClick: () =>
              messages.sendMessage(
                channels.getChannelId(),
                { content: this.state.currentItem.url }
              )
          }, {
            type: 'button',
            name: 'Copy URL',
            onClick: () =>
              clipboard.writeText(this.state.currentItem.url)
          }],

          [{
            type: 'slider',
            name: 'Volume',
            defaultValue: this.state.volume,
            onValueChange: (val) =>
              SpotifyPlayer.setVolume(Math.round(val))
                .then(() => true)
          }]
        ]
      })
    );
  }
};