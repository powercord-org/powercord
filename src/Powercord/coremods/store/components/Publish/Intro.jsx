/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
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
          You just finished making your plugin or theme and want to publish it? Great! You're almost there! Once
          the procedure is complete, your plugin will get a repo on our community GitHub org and have a spot
          in the store.
        </p>
        <h2 className={size32}>Requirements</h2>
        <p className={`${size16} ${marginBottom20}`}>
          Make sure your product meets the following requirements. If it doesn't, you'll be unable to publish it
          to our store.
        </p>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>Comply with our <a href='https://powercord.dev/guidelines' target='_blank'>guidelines</a></div>
          <div className={size16}>These guidelines ensure no malicious plugins or memory eaters enter our store.</div>
        </div>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>Have a properly formatted repository</div>
          <div className={size16}>Your product must be installable simply by git cloning the repository in the appropriate folder.</div>
        </div>
        <div className={marginBottom20}>
          <div className={`${size20} ${marginBottom8}`}>Be licensed under an <a href='https://opensource.org/licenses' target='_blank'>OSI approved license</a></div>
          <div className={size16}><b>Plugin developers, heads up</b>: you cannot license your plugin under the GPL-3.0 or the AGPL-3.0, except if you write a linking exception clause.</div>
          <div className={size16}>Those licenses requires reciprocal licensing on linked works, and neither Powercord or Discord is GPL-compatible. In short, applying this license without linking exception clauses forbids the users to use your plugin.</div>
          <div className={size16}>Be careful when choosing your license, and use a license that doesn't have this reciprocal linking clause.</div>
        </div>
      </>
    );
  }
);
