const { inject: pcInject } = require('powercord/injector');
const { waitFor, getOwnerInstance, sleep } = require('powercord/util');
const { getModule } = require('powercord/webpack');

module.exports = async function injectAutocomplete () {
  const _this = this;

  const disabledPlugins = powercord.settings.get('disabledPlugins', []);
  const plugins = [ ...powercord.pluginManager.plugins.keys() ]
    .filter(plugin => !disabledPlugins.includes(plugin));
  while (!plugins.every(plugin =>
    (powercord.pluginManager.get(plugin) || { ready: true }).ready // ugly fix lol
  )) {
    await sleep(1);
  }

  const inject = () =>
    this.instance.props.autocompleteOptions.POWERCORD_CUSTOM_COMMANDS = {
      getText: (index, { commands }) => this.prefix + commands[index].command,
      matches: (isValid) => isValid && this.instance.props.value.startsWith(this.prefix),
      queryResults: () => ({
        commands: this.customCommands.filter(c =>
          c.command.startsWith(this.instance.props.value.slice(this.prefix.length))
        )
      }),
      renderResults: (...args) => {
        const renderedResults = this.instance.props.autocompleteOptions.COMMAND.renderResults(...args);
        if (!renderedResults) {
          return;
        }

        const [ header, commands ] = renderedResults;

        header.type = class PatchedHeaderType extends header.type {
          renderContent (...originalArgs) {
            const rendered = super.renderContent(...originalArgs);

            if (
              Array.isArray(rendered.props.children) &&
              rendered.props.children[1]
            ) {
              const commandPreviewChildren = rendered.props.children[1].props.children;
              if (commandPreviewChildren[0].startsWith('/')) {
                commandPreviewChildren[0] = commandPreviewChildren[0].replace(`/${_this.prefix.slice(1)}`, _this.prefix);
              }
            }

            return rendered;
          }
        };

        for (const command of commands) {
          command.type = class PatchedCommandType extends command.type {
            renderContent (...originalArgs) {
              const rendered = super.renderContent(...originalArgs);

              const { children } = rendered.props;
              if (children[0].props.name === 'Slash') {
                rendered.props.children.shift();
              }

              const commandName = children[0].props;
              if (!commandName.children.startsWith(_this.prefix)) {
                commandName.children = _this.prefix + commandName.children;
              }

              return rendered;
            }
          };
        }

        return [ header, commands ];
      }
    };

  const taClass = (await getModule([ 'channelTextArea', 'channelTextAreaEnabled' ]))
    .channelTextArea.split(' ')[0];

  await waitFor(`.${taClass}`);

  const updateInstance = () =>
    (this.instance = getOwnerInstance(document.querySelector(`.${taClass}`)));
  const instancePrototype = Object.getPrototypeOf(updateInstance());

  pcInject('pc-commands-autocomplete', instancePrototype, 'componentDidMount', (args, originReturn) => {
    updateInstance();
    inject();
    return originReturn;
  });

  inject();
};
