const { React } = require('ac/webpack');
const SpotifyPlayer = require('../SpotifyPlayer');

module.exports = class SeekBar extends React.Component {
  constructor () {
    super();

    this.state = {
      renderInterval: null
    };

    this.seek = this.seek.bind(this);
    this.endSeek = this.endSeek.bind(this);
  }

  componentDidMount () {
    this.setState({
      renderInterval: setInterval(() => this.forceUpdate(), 1000)
    });
  }

  componentWillUnmount () {
    const { seekBar } = this.props.main.state;

    if (seekBar.seekListeners.seek) {
      document.removeEventListener('mousemove', this.seek);
    }

    if (seekBar.seekListeners.stop) {
      document.removeEventListener('mouseup', this.endSeek);
    }

    if (this.state.renderInterval) {
      clearInterval(this.state.renderInterval);
    }
  }

  setMainState (newState) {
    this.props.main.setState(oldState => ({
      seekBar: {
        ...oldState.seekBar,
        ...newState
      }
    }));
  }

  startSeek (e) {
    this.setMainState({
      seeking: true 
    });

    SpotifyPlayer.pause();

    document.addEventListener('mousemove', this.seek);
    document.addEventListener('mouseup', this.endSeek);

    this.seek(e);
  }

  seek ({ clientX: mouseX }) {
    const { x, width } = document.querySelector('.aethcord-spotify-seek-bar').getBoundingClientRect();
    const delta = mouseX - x;
    const seek = delta / width;

    this.setMainState({
      progress: Math.round(this.props.main.state.currentItem.duration * seek),
      progressAt: Date.now()
    });
  }

  async endSeek () {
    const { seekBar } = this.props.main.state;

    document.removeEventListener('mousemove', this.seek);
    document.removeEventListener('mouseup', this.endSeek);

    await SpotifyPlayer.seek(seekBar.progress);
    await SpotifyPlayer.play();
    this.setMainState({
      seeking: false 
    });
  }

  render () {
    const { state } = this.props.main;

    const progress = state.isPlaying
      ? state.seekBar.progress + (Date.now() - state.seekBar.progressAt)
      : state.seekBar.progress;

    const current = Math.min(progress / state.currentItem.duration * 100, 100);

    return (
      <div
        className='aethcord-spotify-seek'
        onMouseEnter={() => this.setMainState({ showDurations: true })}
        onMouseLeave={() => this.setMainState({ showDurations: false })}
      >
        <div className='aethcord-spotify-seek-durations'>
          <span className='aethcord-spotify-seek-duration'>
            {this.formatTime(progress)}
          </span>
          <span className='aethcord-spotify-seek-duration'>
            {this.formatTime(state.currentItem.duration)}
          </span>
        </div>
        <div className='aethcord-spotify-seek-bar' onMouseDown={(e) => this.startSeek(e)}>
          <span className='aethcord-spotify-seek-bar-progress' style={{ width: current + '%' }}/>
          <span className='aethcord-spotify-seek-bar-cursor' style={{ left: current + '%' }}/>
        </div>
        <div className='aethcord-spotify-seek-spacer' />
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
}