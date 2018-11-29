const { React, contextMenu, messages, channels } = require('ac/webpack');
const { ContextMenu } = require('ac/components');
const { concat } = require('ac/util');
const { clipboard } = require('electron');
const SpotifyPlayer = require('./SpotifyPlayer.js');

module.exports = class Modal extends React.Component {
  constructor () {
    super();

    this.state = {
      showDurations: false,
      currentItem: {
        name: '',
        artists: [ '' ],
        img: '',
        url: '',
        duration: 0
      },
      progress: 0,
      progressAt: new Date().getTime(),
      isPlaying: true,
      volume: 0,
      deviceID: '',
      renderInterval: null,
      seekListeners: {
        seek: null,
        stop: null
      },
      displayState: 'hide'
    };
  }

  updateData (playerState) {
    if (playerState) {
      return this.setState({
        currentItem: {
          name: playerState.item.name,
          artists: playerState.item.artists.map(artist => artist.name),
          img: playerState.item.album.images[0].url,
          url: playerState.item.external_urls.spotify,
          duration: playerState.item.duration_ms
        },
        progress: playerState.progress_ms,
        progressAt: new Date().getTime(),
        isPlaying: playerState.is_playing,
        volume: playerState.device.volume_percent,
        deviceID: playerState.device.id,
        displayState: 'show'
      });
    }
  }

  async componentDidMount () {
    this.setState({ renderInterval: setInterval(() => this.forceUpdate(), 1000) });
    this.props.main.on('event', async (data) => {
      switch (data.type) {
        case 'PLAYER_STATE_CHANGED':
          return this.updateData(data.event.state);

        case 'DEVICE_STATE_CHANGED':
          const { devices } = await SpotifyPlayer.getDevices();
          if (!devices[0]) {
            return this.setState({
              displayState: 'hide'
            });
          }
      }
    });

    return this.updateData(
      await SpotifyPlayer.getPlayer()
    );
  }

  componentWillUnmount () {
    if (this.state.seekListeners.seek !== null) document.removeEventListener('mousemove', this.state.seekListeners.seek);
    if (this.state.seekListeners.stop !== null) document.removeEventListener('mouseup', this.state.seekListeners.stop);
    if (this.state.renderInterval !== null) clearInterval(this.state.renderInterval)
  }

  onButtonClick (method, ...args) {
    return SpotifyPlayer[method](...args)
      .then(() => true);
  }

  render () {
    const { currentItem, isPlaying } = this.state;
    const artists = concat(currentItem.artists);

    let progress = this.state.progress;
    if (this.state.isPlaying) progress = this.state.progress + (new Date().getTime() - this.state.progressAt);
    const current = progress / this.state.currentItem.duration * 100;
    let className = 'container-2Thooq aethcord-spotify';
    if (this.state.showDurations || this.state.seekListeners.seek !== null) {
      className += ' expend';
    }
    const style = this.state.displayState === 'hide'
      ? { display: 'none' }
      : {};

    return (
      <div
        className={className}
        id='aethcord-spotify-modal'
        onContextMenu={this.injectContextMenu.bind(this)}
        style={style}
      >
        <div
          className='wrapper-2F3Zv8 small-5Os1Bb avatar-small'
          style={{ backgroundImage: `url("${currentItem.img}")` }}
        />
        <div className='accountDetails-3k9g4n nameTag-m8r81H'>
          <span className="username">{currentItem.name}</span>
          <span className="discriminator">{artists ? `by ${artists}` : ''}</span>
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
        <div
          className='aethcord-spotify-seek' onMouseEnter={() => this.setState({ showDurations: true })}
          onMouseLeave={() => this.setState({ showDurations: false })}
        >
          <div className='aethcord-spotify-seek-durations'>
            <span className='aethcord-spotify-seek-duration'>{this.formatTime(progress)}</span>
            <span className='aethcord-spotify-seek-duration'>{this.formatTime(this.state.currentItem.duration)}</span>
          </div>
          <div className='aethcord-spotify-seek-bar' onMouseDown={(e) => this.startSeek(e)}>
            <span className='aethcord-spotify-seek-bar-progress' style={{ width: current + '%' }}/>
            <span className='aethcord-spotify-seek-bar-cursor' style={{ left: current + '%' }}/>
          </div>
        </div>
      </div>
    );
  }

  formatTime (time) {
    time = Math.round(time / 1000);
    let hours = Math.floor(time / 3600) % 24;
    let minutes = Math.floor(time / 60) % 60;
    let seconds = time % 60;
    return [ hours, minutes, seconds ]
      .map(v => v < 10 ? '0' + v : v)
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  }

  startSeek (e) {
    SpotifyPlayer.pause();
    const seekListener = this.seek.bind(this);
    const stopSeekListener = this.endSeek.bind(this);
    document.addEventListener('mousemove', seekListener);
    document.addEventListener('mouseup', stopSeekListener);
    this.setState({
      seekListeners: {
        seek: seekListener,
        stop: stopSeekListener
      }
    });
    this.seek(e)
  }

  async endSeek () {
    document.removeEventListener('mousemove', this.state.seekListeners.seek);
    document.removeEventListener('mouseup', this.state.seekListeners.stop);
    this.setState({
      seekListeners: {
        seek: null,
        stop: null
      }
    });

    await SpotifyPlayer.seek(this.state.progress);
    SpotifyPlayer.play();
  }

  seek (e) {
    const boundingClientRect = document.querySelector('.aethcord-spotify-seek-bar').getBoundingClientRect();
    const mouseX = e.clientX;
    const delta = mouseX - boundingClientRect.x;
    const seek = delta / boundingClientRect.width;
    this.setState({ progress: Math.round(this.state.currentItem.duration * seek) });
  }

  async injectContextMenu (event) {
    const { pageX, pageY } = event;

    contextMenu.openContextMenu(event, () =>
      React.createElement(ContextMenu, {
        pageX,
        pageY,
        itemGroups: [
          [ {
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
          } ],

          [ {
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
          } ],

          [ {
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
          } ],

          [ {
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
