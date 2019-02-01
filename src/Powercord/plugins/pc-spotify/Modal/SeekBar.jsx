const { React } = require('powercord/webpack');
const { formatTime } = require('powercord/util');
const SpotifyPlayer = require('../SpotifyPlayer');

module.exports = class SeekBar extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      seeking: false,
      progress: null,
      wasPlaying: false,
      renderInterval: null
    };

    this.seek = this.seek.bind(this);
    this.endSeek = this.endSeek.bind(this, false);
  }

  componentDidMount () {
    this.setState({
      renderInterval: setInterval(() => this.forceUpdate(), 1000)
    });
  }

  componentDidUpdate (prevProps) {
    if (!this.state.seeking && this.props.progress !== prevProps.progress) {
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

  async startSeek (e) {
    this.seek(e);
    document.addEventListener('mousemove', this.seek);
    document.addEventListener('mouseup', this.endSeek);

    this.props.onSeeking(true);
    this.setState({
      seeking: true,
      wasPlaying: this.props.isPlaying
    });
    if (!await SpotifyPlayer.pause()) {
      await this.endSeek(true);
    }
  }

  seek ({ clientX: mouseX }) {
    const { x, width } = document.querySelector('.powercord-spotify-seek-bar').getBoundingClientRect();
    const delta = mouseX - x;
    const seek = delta / width;
    this.setState({ progress: Math.round(this.props.duration * Math.max(0, Math.min(seek, 1))) });
  }

  async endSeek (cancel) {
    document.removeEventListener('mousemove', this.seek);
    document.removeEventListener('mouseup', this.endSeek);

    this.props.onSeeking(false);
    this.setState({ seeking: false });
    if (cancel) {
      this.setState({ progress: false });
    } else {
      await SpotifyPlayer.seek(this.state.progress);
      if (this.state.wasPlaying) {
        await SpotifyPlayer.play();
      }
    }
  }

  render () {
    const rawProgress = this.state.progress || this.props.progress;
    const progress = (this.props.isPlaying && !this.state.seeking)
      ? rawProgress + (Date.now() - this.props.progressAt)
      : rawProgress;

    const current = Math.min(progress / this.props.duration * 100, 100);

    return (
      <div className='powercord-spotify-seek'>
        <div className='powercord-spotify-seek-elements'>
          <span className='powercord-spotify-seek-duration'>
            {formatTime(progress)}
          </span>
          {this.props.children}
          <span className='powercord-spotify-seek-duration'>
            {formatTime(this.props.duration)}
          </span>
        </div>
        <div className='powercord-spotify-seek-bar' onMouseDown={(e) => this.startSeek(e)}>
          <span className='powercord-spotify-seek-bar-progress' style={{ width: `${current}%` }}/>
          <span className='powercord-spotify-seek-bar-cursor' style={{ left: `${current}%` }}/>
        </div>
        <div className='powercord-spotify-seek-spacer'/>
      </div>
    );
  }
};
