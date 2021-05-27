/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { createElement } = require("powercord/util");
const { React } = require("powercord/webpack");
const { resolveCompiler } = require("powercord/compilers");

module.exports = {
    loadStyle(file) {
        const id = Math.random().toString(36).slice(2);
        const style = createElement("style", {
            id: `style-coremod-${id}`,
            "data-powercord": true,
            "data-coremod": true
        });

        document.head.appendChild(style);
        const compiler = resolveCompiler(file);
        compiler.compile().then((css) => (style.innerHTML = css));
        return id;
    },

    wrapInHooks(fn) {
        return function (...args) {
            const owo = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
            const ogUseMemo = owo.useMemo;
            const ogUseState = owo.useState;
            const ogUseEffect = owo.useEffect;
            const ogUseLayoutEffect = owo.useLayoutEffect;
            const ogUseRef = owo.useRef;
            const ogUseCallback = owo.useCallback;

            owo.useMemo = (f) => f();
            owo.useState = (v) => [v, () => void 0];
            owo.useEffect = () => null;
            owo.useLayoutEffect = () => null;
            owo.useRef = () => ({});
            owo.useCallback = (c) => c;

            const res = fn(...args);

            owo.useMemo = ogUseMemo;
            owo.useState = ogUseState;
            owo.useEffect = ogUseEffect;
            owo.useLayoutEffect = ogUseLayoutEffect;
            owo.useRef = ogUseRef;
            owo.useCallback = ogUseCallback;

            return res;
        };
    },

    unloadStyle(id) {
        const el = document.getElementById(`style-coremod-${id}`);
        if (el) {
            el.remove();
        }
    }
};
