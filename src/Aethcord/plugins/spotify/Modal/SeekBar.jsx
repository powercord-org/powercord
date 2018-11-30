const { React } = require('ac/webpack');
const SpotifyPlayer = require('../SpotifyPlayer');

module.exports = class SeekBar extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      progress: null,
      wasPlaying: false,
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

  componentDidUpdate(prevProps) {
    if (this.props.progress !== prevProps.progress) {
      this.setState({ progress: null });
    }
  }

  componentWillUnmount () {
    if (this.state.listeners.seek) {
      document.removeEventListener('mousemove', this.seek);
    }

    if (this.state.listeners.stop) {
      document.removeEventListener('mouseup', this.endSeek);
    }

    if (this.state.renderInterval) {
      clearInterval(this.state.renderInterval);
    }
  }

  startSeek (e) {
    this.setState({
      wasPlaying: this.props.isPlaying
    });

    if (this.props.isPlaying) {
      SpotifyPlayer.pause();
    }

    document.addEventListener('mousemove', this.seek);
    document.addEventListener('mouseup', this.endSeek);

    this.seek(e);
  }

  seek ({ clientX: mouseX }) {
    const { x, width } = document.querySelector('.aethcord-spotify-seek-bar').getBoundingClientRect();
    const delta = mouseX - x;
    const seek = delta / width;

    this.setState({ progress: Math.round(this.props.duration * seek) });
  }

  async endSeek () {
    document.removeEventListener('mousemove', this.seek);
    document.removeEventListener('mouseup', this.endSeek);

    await SpotifyPlayer.seek(this.state.progress);
    if (this.state.wasPlaying) {
      await SpotifyPlayer.play();
    }
  }

  render () {
    const rawProgress = this.state.progress || this.props.progress;
    const progress = this.props.isPlaying
      ? rawProgress + (Date.now() - this.props.progressAt)
      : rawProgress;

    const current = Math.min(progress / this.props.duration * 100, 100);

    return (
      <div
        className='aethcord-spotify-seek'
        onMouseEnter={() => this.props.onDurationToggle(true)}
        onMouseLeave={() => this.props.onDurationToggle(false)}
      >
        <div className='aethcord-spotify-seek-durations'>
          <span className='aethcord-spotify-seek-duration'>
            {this.formatTime(progress)}
          </span>
          <span className='aethcord-spotify-seek-duration'>
            {this.formatTime(this.props.duration)}
          </span>
        </div>
        <div className='aethcord-spotify-seek-bar' onMouseDown={(e) => this.startSeek(e)}>
          <span className='aethcord-spotify-seek-bar-progress' style={{ width: current + '%' }}/>
          <span className='aethcord-spotify-seek-bar-cursor' style={{ left: current + '%' }}/>
        </div>
        <div className='aethcord-spotify-seek-spacer'/>
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
};
