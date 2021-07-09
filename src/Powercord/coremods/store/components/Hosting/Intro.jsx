/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');

module.exports = React.memo(
  () => {
    const { size32, size20, size16 } = getModule([ 'size24' ], false);
    const { marginBottom20, marginBottom8 } = getModule([ 'marginBottom20' ], false);

    return (
      <>
        <p className={size16}>
          You want to make an amazing plugin, but this plugins requires a server and a backend? We got you covered. If
          you need a backend for any reason for your plugin, we are willing to host it for you and hook you up with
          an *.powercord.dev address, provided your backend meets some requirements.
        </p>
        <h2 className={size32}>Requirements</h2>
        <p className={`${size16} ${marginBottom20}`}>
          To keep our server hamsters alive, you must comply with the following requirements in order to be eligible:
        </p>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>Code must meet basic quality standards</div>
          <div className={size16}>It means it has to include reasonable security, and not be over-engineered.</div>
        </div>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>It must not be resource intensive</div>
          <div className={size16}>We don't have unlimited CPU and memory. Unless you have a memory leak or you're shipping a crypto miner, you should be fine.</div>
        </div>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>Be licensed under an <a href='https://opensource.org/licenses' target='_blank'>OSI approved license</a></div>
          <div className={size16}>This is for transparency and to ensure we are allowed to run your code on our server.</div>
        </div>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>We must be able to run it without having to install a billion things</div>
          <div className={size16}>If you need really specific things, we encourage you to use Docker.</div>
        </div>
        <div className={`${size16} ${marginBottom20}`}>
          If your backend happens to have an unforeseen memory leak, unexpected CPU usage, or we become aware of a
          potential security vulnerability, we'll take immediate action on our end to protect our server and the users,
          as well as notifying you of our findings.
        </div>
      </>
    );
  }
);
