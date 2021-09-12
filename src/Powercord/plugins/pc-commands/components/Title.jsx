const { React } = require('powercord/webpack');

module.exports = class Title extends React.Component {
  render () {
    if (!this.props.title[0]) {
      return <div style={{ padding: '4px' }}/>;
    }

    return (
      <div class='base-1pYU8j'>
        <h3 class='contentTitle-2tG_sM base-1x0h_U size12-3cLvbJ'>{this.props.title}</h3>
      </div>
    );
  }
};
