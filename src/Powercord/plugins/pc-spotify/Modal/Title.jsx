const { React } = require('powercord/webpack');

module.exports = class Title extends React.Component {
  constructor (props) {
    super(props);

    this.canvas = document.createElement('canvas').getContext('2d');
    this.state = {
      hovered: false
    };
  }

  render () {
    const titleElement = document.querySelector(`.${this.props.className.split(' ')[0]}`);
    this.canvas.font = titleElement ? getComputedStyle(titleElement).font : null;
    const titleWidth = Math.ceil(this.canvas.measureText(this.props.children).width);
    const animationDuration = (titleWidth - 84) * 90;
    let { className } = this.props;
    if (this.state.hovered) {
      className += ' translating';
    }

    return (
      <span
        onMouseEnter={() => this.setState({ hovered: titleWidth > titleElement.offsetWidth })}
        onMouseLeave={() => this.setState({ hovered: false })}
        className={className}
        style={{
          animationDuration: `${animationDuration}ms`,
          width: this.state.hovered ? titleWidth : 84,
          maxWidth: this.state.hovered ? titleWidth : 84
        }}
      >{this.props.children}</span>
    );
  }
};
