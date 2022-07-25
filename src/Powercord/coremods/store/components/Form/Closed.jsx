const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { DISCORD_INVITE, SpecialChannels: { SUPPORT_MISC } } = require('powercord/constants');
const { gotoOrJoinServer } = require('powercord/util');

const Banned = React.memo(
  () => {
    const GatedContent = getModuleByDisplayName('GatedContent', false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const { ageGatedImage } = getModule([ 'ageGatedImage' ], false);

    return (
      <div className={`powercord-store ${pageWrapper}`}>
        <GatedContent
          imageClassName={ageGatedImage}
          title={'Sorry not sorry, you\'ve been banned'}
          description={'Replugged Staff banned you from submitting this form due to abuse. To appeal the ban, please join our support server, and ask for help in #misc-support.'}
          onAgree={() => window.history.back()}
          onDisagree={() => gotoOrJoinServer(DISCORD_INVITE, SUPPORT_MISC)}
          disagreement='Support Server'
          agreement='Back'
        />
      </div>
    );
  }
);

const Unavailable = React.memo(
  () => {
    const GatedContent = getModuleByDisplayName('GatedContent', false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const { ageGatedImage } = getModule([ 'ageGatedImage' ], false);

    return (
      <div className={`powercord-store ${pageWrapper}`}>
        <GatedContent
          imageClassName={ageGatedImage}
          title={'We\'re not accepting submissions at this time'}
          description={'Please try again later.'}
          onAgree={() => window.history.back()}
          onDisagree={() => gotoOrJoinServer(DISCORD_INVITE)}
          disagreement='Support Server'
          agreement='Back'
        />
      </div>
    );
  }
);

module.exports = {
  Banned,
  Unavailable
};
