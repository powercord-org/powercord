/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { Flex } = require('powercord/components');

// @todo: check from /api/v2/store/forms/eligibility
module.exports = React.memo(
  () => {
    const { imageError } = getModule([ 'imageError' ], false);
    const { weightMedium } = getModule([ 'weightMedium' ], false);
    const { size32, size24, size16 } = getModule([ 'size24' ], false);
    const { marginBottom20, marginBottom8 } = getModule([ 'marginBottom20' ], false);
    return (
      <Flex align={Flex.Align.CENTER}>
        <Flex.Child grow={0} className={imageError}/>
        <Flex.Child>
          <h2 className={`${size32} ${weightMedium} ${marginBottom8}`}>Houston, we have a problem.</h2>
          <h3 className={`${size24} ${marginBottom20}`}>Sorry not sorry, you're banned.</h3>
          <div className={`${size16} ${marginBottom8}`}>Powercord Staff banned you from submitting this form due to abuse.</div>
          <div className={`${size16} ${marginBottom8}`}>To appeal, please join the support server and reach out to a Staff member in the #misc-support channel.</div>
        </Flex.Child>
      </Flex>
    );
  }
);
