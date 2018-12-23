const { React } = require('powercord/webpack');
const { formatTime } = require('powercord/util');

module.exports = class Title extends React.Component {
  constructor (props) {
    super(props);

    this.canvas = document.createElement('canvas').getContext('2d');
    this.state = {
      hovered: false
    };
  }

  render () {
    this.canvas.font = getComputedStyle(document.querySelector(`.${this.props.className}`)).font;
    const titleWidth = Math.ceil(this.canvas.measureText(this.props.children).width);
    console.log(titleWidth);
    const animationDuration = Math.ceil(titleWidth - 84) * 125;
    let className = this.props.className;
    if (this.state.hovered) {
      className += ' translating';
    }

    return (
      <span
        onMouseEnter={() => this.setState({ hovered: titleWidth > 84 })}
        onMouseLeave={() => this.setState({ hovered: false })}
        className={className}
        style={{
          animationDuration: `${animationDuration}ms`,
          width: this.state.hovered ? titleWidth * 2 : 84,
          maxWidth: this.state.hovered ? titleWidth * 2 : 84
        }}
      >
       {this.props.children}
       {this.state.hovered && ` ${this.props.children}`}
      </span>
    );
  }
};
