const { getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');

module.exports = AsyncComponent.from((async () => {
  const DiscordModal = await getModuleByDisplayName('SpotifyPremiumUpgrade');
  class PremiumModal extends DiscordModal {
    render () {
      const res = super.render();
      res.props.className = 'spotify-premium-required';
      res.props.children[1].props.children[1].props.children = Messages.SPOTIFY_PREMIUM_REQUIRED;
      return res;
    }
  }
  return PremiumModal;
})());
