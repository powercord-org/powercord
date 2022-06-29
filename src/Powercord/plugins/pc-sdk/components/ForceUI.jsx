const { React, getModule } = require('powercord/webpack');
const { ButtonItem } = require('powercord/components/settings');
const { getOwnerInstance } = require('powercord/util');

class ForceUI extends React.PureComponent {
  render () {
    return (
      <div id='force-ui' className='category'>
        <h2>Force UI</h2>
        <p>
          Some elements are painful to theme, either because they are locked to specific cases or are simply features you
          cannot always access (e.g. Verified perks, Nitro, etc.). By using this tool, you can trick Discord's UI and forcefully
          show those elements to your heart's desire.
        </p>
        {this.renderForceMentionEveryone()}
      </div>
    );
  }

  renderForceMentionEveryone () {
    // @todo: Disable when not applicable
    return (
      <ButtonItem
        note={'In large servers, trying to ping everyone will show a warning asking you if you\'re sure you want to perform this action.'}
        button='Display in Client'
        onClick={() => this.forceMentionEveryone()}
      >
          @everyone ping warning
      </ButtonItem>
    );
  }

  // Handlers
  forceMentionEveryone () {
    const { applyChatRestrictions } = getModule([ 'applyChatRestrictions' ], false);
    const everyoneMdl = getModule([ 'extractEveryoneRole' ], false);
    const ogExtractEveryoneRole = everyoneMdl.extractEveryoneRole;
    const ogShouldShowEveryoneGuard = everyoneMdl.shouldShowEveryoneGuard;
    const fakeChannel = {
      id: 'yes',
      permissionOverwrites: {},
      getGuildId: () => 'yes',
      isThread: () => false,
      isForumPost: () => false
    };

    try {
      const discordTextarea = document.querySelector('form > div > div > div');
      const instance = getOwnerInstance(discordTextarea);

      const ChannelTextAreaForm = instance?._reactInternals?.return?.return;
      if (ChannelTextAreaForm) {
        everyoneMdl.extractEveryoneRole = () => '@everyone';
        everyoneMdl.shouldShowEveryoneGuard = () => true;

        applyChatRestrictions({
          openWarningPopout: (e) => ChannelTextAreaForm.stateNode.setState({ contentWarningProps: e }),
          type: ChannelTextAreaForm.memoizedProps.chatInputType,
          content: 'yes',
          channel: fakeChannel
        });

        everyoneMdl.extractEveryoneRole = ogExtractEveryoneRole;
        everyoneMdl.shouldShowEveryoneGuard = ogShouldShowEveryoneGuard;
      }
    } catch (e) {
      console.error('Failed to display everyone guard:', e);
    }
  }
}

/*
 * Upload modal
 * Call modal
 * Search popup
 * Different Nitro states
 * Nitro boost plans
 * Verified server tabs
 * Twitch & YouTube integration settings
 * Offline & Login screens
 * Typing indicator
 */
module.exports = ForceUI;
