/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React } = require('powercord/webpack');
const { TextInput, TextAreaInput, CheckboxInput } = require('powercord/components/settings');

module.exports = React.memo(
  () => (
    <>
      <TextAreaInput
        required
        maxLength={1024}
        note={'Describe what your backend does and what you\'ll be using it for.'}
      >
        What's the backend about
      </TextAreaInput>
      <TextAreaInput
        required
        maxLength={1024}
        note={'What language is your backend in? What are the technologies used in it?'}
      >
        Technical details
      </TextAreaInput>
      <TextInput
        required
        maxLength={16}
        note={'Request here the subdomain you\'d like your backend to run on.'}
      >
        Subdomain
      </TextInput>
      <TextInput
        required
        maxLength={256}
        note={'Git repository where your backend\'s source code is published.'}
      >
        Repository URL
      </TextInput>
      <CheckboxInput>My backend meets reasonable standards regarding security</CheckboxInput>
      <CheckboxInput>My backend and its operations comply with all the applicable privacy laws</CheckboxInput>
    </>
  )
);
