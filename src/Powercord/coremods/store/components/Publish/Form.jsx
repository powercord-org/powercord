const { React } = require('powercord/webpack');
const { TextInput, TextAreaInput, CheckboxInput } = require('powercord/components/settings');

module.exports = React.memo(
  () => (
    <>
      <TextInput required>Product name</TextInput>
      <TextInput
        required
        note={'In order for us to review your product you\'ll need to publish it to a GitHub repository. For plugins, once the review process is complete we\'ll ask you to publish it on the powercord-community GitHub org.'}
        maxLength={256}
      >
        Repository URL
      </TextInput>
      <TextInput
        note={'Let us know if your product is an alternative to an existing one for BetterDiscord. Provide a URL from betterdiscordlibrary.com or raw.githubusercontent.com. We only accept approved BetterDiscord products.'}
        maxLength={256}
      >
        BetterDiscord alternative
      </TextInput>
      <TextAreaInput
        note={'Feel free to tell us anything you believe will be useful for the review process. If you used discouraged methods such as direct API calls, providing an explanation here can help speeding up the review process if your use is legitimate.'}
        maxLength={1024}
      >
        Notes
      </TextAreaInput>
      <CheckboxInput>My product complies with <a href='https://powercord.dev/guidelines' target='_blank'>Powercord's Community Guidelines</a></CheckboxInput>
    </>
  )
);
