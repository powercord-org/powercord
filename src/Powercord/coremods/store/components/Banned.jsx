/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { DISCORD_INVITE, MAGIC_CHANNELS: { SUPPORT: { MISC } } } = require('powercord/constants');
const { gotoOrJoinServer } = require('powercord/util');

module.exports = React.memo(
  () => {
    const GatedContent = getModuleByDisplayName('GatedContent', false);
    const { pageWrapper } = getModule([ 'pageWrapper' ], false);
    const { ageGatedImage } = getModule([ 'ageGatedImage' ], false);

    return (
      <div className={`powercord-store ${pageWrapper}`}>
        <GatedContent
          imageClassName={ageGatedImage}
          title={'Sorry not sorry, you\'ve been banned.'}
          description={'Powercord Staff banned you from submitting this form due to abuse. To appeal the ban, please join our support server, and ask for help in #misc-support.'}
          onAgree={() => window.history.back()}
          onDisagree={() => gotoOrJoinServer(DISCORD_INVITE, MISC)}
          disagreement='Support Server'
          agreement='Back'
        />
      </div>
    );
  }
);
