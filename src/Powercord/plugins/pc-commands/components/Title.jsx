const { React, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');

module.exports = AsyncComponent.from(
  (async () => {
    const Autocomplete = await getModuleByDisplayName('Autocomplete');

    return (props) => {
      // eslint-disable-next-line new-cap
      const res = Autocomplete?.Title?.(props);
      const EmptyContainer = <div style={{ padding: '4px' }}/>;

      if (Array.isArray(props?.title) && !props.title[0]) {
        return EmptyContainer;
      }

      return res || EmptyContainer;
    };
  })()
);
