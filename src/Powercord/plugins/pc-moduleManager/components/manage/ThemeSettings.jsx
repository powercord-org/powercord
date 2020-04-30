const { React, Flux, i18n: { Messages } } = require('powercord/webpack');

class ThemeSettings extends React.PureComponent {
  render () {
    const theme = powercord.styleManager.get('Discord_Theme').manifest;
    if (!theme || ((!theme.settings || theme.settings.options.length === 0) && (!theme.plugins || theme.plugins.length === 0))) {
      return (
        <div style={{
          fontSize: 69,
          marginTop: 69,
          textAlign: 'center',
          fontFamily: '"Comic Sans MS", "Comic Sans", cursive'
        }}>{Messages.SETTINGS_GAMES_NOT_PLAYING}</div>
      );
    }
    return null;
  }
}

module.exports = Flux.connectStores(
  [ powercord.api.settings.store ],
  ({ theme }) => ({
    ...powercord.api.settings._fluxProps(`theme-${theme}`)
  })
)(ThemeSettings);
