const { React, getModule } = require('powercord/webpack');

let badgesLength,
  numberBadgeClasses;

module.exports = class NumberBadge extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      hovered: false,
      modules: {
        badgesLength,
        numberBadgeClasses
      }
    };
  }

  async componentDidMount () {
    if (!badgesLength) {
      badgesLength = await getModule([ 'getBadgeWidthForValue' ]);
      numberBadgeClasses = await getModule([ 'numberBadge', 'base' ]);

      this.setState({
        badgesLength,
        numberBadgeClasses
      });
    }
  }

  render () {
    if (!badgesLength) {
      return null;
    }

    return <div
      className={`${numberBadgeClasses.numberBadge} ${numberBadgeClasses.base}`}
      style={{
        backgroundColor: 'rgb(240, 71, 71)',
        width: badgesLength.getBadgeWidthForValue(this.props.count),
        paddingRight: 1
      }}
    >
      {this.props.count}
    </div>;
  }
};
