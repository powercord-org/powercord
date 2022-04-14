const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Icons: { badges: { Staff } } } = require('powercord/components');

module.exports = React.memo(
  () => {
    const GatedContent = getModuleByDisplayName('GatedContent', false);
    const { transitionTo } = getModule([ 'transitionTo' ], false);

    return (
      <GatedContent
        imageClassName='powercord-store-success'
        title={'Success! We received your form.'}
        description={<>We'll give it the attention it deserved and reach out once this process is complete. You can identify Powercord Staff members thanks to the <Staff width={16} height={16}/> badge on their profile.</>}
        onDisagree={() => transitionTo('/_powercord/store/plugins')}
        disagreement='Go back to store'
      />
    );
  }
);
