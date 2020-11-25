/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const DragSourceConnectedGuild = await getModule([ 'LurkingGuild' ]);
  const { DecoratedComponent } = DragSourceConnectedGuild.default;

  const owo = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
  const ogUseState = owo.useState;
  const ogUseLayoutEffect = owo.useLayoutEffect;
  const ogUseContext = owo.useContext;
  const ogUseRef = owo.useRef;

  owo.useState = () => [ null, () => void 0 ];
  owo.useLayoutEffect = () => null;
  owo.useRef = () => ({});
  owo.useContext = () => ({});

  const Guild = new DecoratedComponent({ guildId: null }).type;

  owo.useState = ogUseState;
  owo.useLayoutEffect = ogUseLayoutEffect;
  owo.useContext = ogUseContext;
  owo.useRef = ogUseRef;

  inject('pc-utilitycls-guilds', Guild.prototype, 'render', function (_, res) {
    const { audio, badge: mentions, selected, unread, video } = this.props;

    const conditionals = {
      unread,
      selected,
      audio,
      video,
      mentioned: mentions > 0
    };

    Object.keys(conditionals).forEach(key => {
      if (conditionals[key]) {
        res.props.className += ` ${key}`;
      }
    });

    res.props['data-guild-name'] = this.props.guild.name;
    res.props['data-guild-id'] = this.props.guildId;

    return res;
  });

  return () => uninject('pc-utilitycls-guilds');
};
