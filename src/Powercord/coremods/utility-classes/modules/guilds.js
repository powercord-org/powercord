/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const DragSourceConnectedGuild = await getModule([ 'LurkingGuild' ]);
  const { DecoratedComponent } = DragSourceConnectedGuild.default;

  const owo = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
  const ogUseMemo = owo.useMemo;
  const ogUseState = owo.useState;
  const ogUseCallback = owo.useCallback;
  const ogUseContext = owo.useContext;
  const ogUseEffect = owo.useEffect;
  const ogUseLayoutEffect = owo.useLayoutEffect;
  const ogUseRef = owo.useRef;
  const ogUseReducer = owo.useReducer;

  owo.useMemo = (f) => f();
  owo.useState = (v) => [ v, () => void 0 ];
  owo.useCallback = (v) => v;
  owo.useContext = (ctx) => ctx._currentValue;
  owo.useEffect = () => null;
  owo.useLayoutEffect = () => null;
  owo.useRef = () => ({});
  owo.useReducer = () => ({});

  const Guild = new DecoratedComponent({ guildId: null }).type;

  owo.useMemo = ogUseMemo;
  owo.useState = ogUseState;
  owo.useCallback = ogUseCallback;
  owo.useContext = ogUseContext;
  owo.useEffect = ogUseEffect;
  owo.useLayoutEffect = ogUseLayoutEffect;
  owo.useRef = ogUseRef;
  owo.useReducer = ogUseReducer;

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
