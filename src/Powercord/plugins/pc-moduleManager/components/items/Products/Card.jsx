const { React, getModule } = require('powercord/webpack');

module.exports = class Card extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      classes: {},
      loaded: false
    };
  }

  async componentDidMount () {
    this.setState({
      classes: { ...await getModule([ 'card', 'loaded' ]) }
    });
  }

  render () {
    const { classes } = this.state;
    return <>
      <div className={[ this.props.className, this.state.loaded ? classes.loaded : classes.loading ].join(' ')}>
        <div className={classes.card} onLoad={() => this.setState({ loaded: true })}>
          {this.props.children}
        </div>
      </div>
    </>;
  }
};
