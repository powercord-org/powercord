const { React, getModule } = require('powercord/webpack');
const { Flex, Button } = require('powercord/components');

module.exports = React.memo(
  ({ renderer, doneCallback, cancelCallback }) => {
    const { size16 } = getModule([ 'size24' ], false);
    const { marginBottom20 } = getModule([ 'marginBottom20' ], false);

    return (
      <>
        <p className={`${size16} ${marginBottom20}`}>Please provide complete and accurate information. Be careful, once submitted you won't be able to modify it! Fields marked with * are required.</p>
        {renderer()}
        <Flex>
          <Flex.Child grow={0}>
            <Button onClick={doneCallback}>Submit</Button>
          </Flex.Child>
          <Flex.Child grow={0}>
            <Button look={Button.Looks.OUTLINED} color={Button.Colors.RED} onClick={cancelCallback}>Go back</Button>
          </Flex.Child>
        </Flex>
      </>
    );
  }
);
