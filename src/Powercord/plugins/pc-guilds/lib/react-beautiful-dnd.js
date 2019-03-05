const { React } = require('powercord/webpack');

/* eslint-disable */
(function (factory) {
  factory(module.exports);
}(function (exports) { 'use strict';
  var React__default = 'default' in React ? React['default'] : React;

  function unwrapExports (x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
    return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math
      ? window : typeof self != 'undefined' && self.Math == Math ? self
        // eslint-disable-next-line no-new-func
        : Function('return this')();
    if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var _core = createCommonjsModule(function (module) {
    var core = module.exports = { version: '2.5.7' };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
    f: f
  };

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var IS_WRAP = type & $export.W;
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE];
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
    var key, own, out;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      if (own && _has(exports, key)) continue;
      // export native or passed
      out = own ? target[key] : source[key];
      // prevent global pollution for namespaces
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
        // bind timers to global for call from export context
        : IS_BIND && own ? _ctx(out, _global)
          // wrap global constructors for prevent change them in library
          : IS_WRAP && target[key] == out ? (function (C) {
            var F = function (a, b, c) {
              if (this instanceof C) {
                switch (arguments.length) {
                  case 0: return new C();
                  case 1: return new C(a);
                  case 2: return new C(a, b);
                } return new C(a, b, c);
              } return C.apply(this, arguments);
            };
            F[PROTOTYPE] = C[PROTOTYPE];
            return F;
            // make static versions for prototype methods
          })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
      if (IS_PROTO) {
        (exports.virtual || (exports.virtual = {}))[key] = out;
        // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
        if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
      }
    }
  };
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
        // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var _library = true;

  var _shared = createCommonjsModule(function (module) {
    var SHARED = '__core-js_shared__';
    var store = _global[SHARED] || (_global[SHARED] = {});

    (module.exports = function (key, value) {
      return store[key] || (store[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: _core.version,
      mode: _library ? 'pure' : 'global',
      copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
    });
  });

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var f$1 = Object.getOwnPropertySymbols;

  var _objectGops = {
    f: f$1
  };

  var f$2 = {}.propertyIsEnumerable;

  var _objectPie = {
    f: f$2
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  // 19.1.2.1 Object.assign(target, source, ...)





  var $assign = Object.assign;

  // should work with symbols and should have deterministic property order (V8 bug)
  var _objectAssign = !$assign || _fails(function () {
    var A = {};
    var B = {};
    // eslint-disable-next-line no-undef
    var S = Symbol();
    var K = 'abcdefghijklmnopqrst';
    A[S] = 7;
    K.split('').forEach(function (k) { B[k] = k; });
    return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
  }) ? function assign(target, source) { // eslint-disable-line no-unused-vars
    var T = _toObject(target);
    var aLen = arguments.length;
    var index = 1;
    var getSymbols = _objectGops.f;
    var isEnum = _objectPie.f;
    while (aLen > index) {
      var S = _iobject(arguments[index++]);
      var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
      var length = keys.length;
      var j = 0;
      var key;
      while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
    } return T;
  } : $assign;

  // 19.1.3.1 Object.assign(target, source)


  _export(_export.S + _export.F, 'Object', { assign: _objectAssign });

  var assign = _core.Object.assign;

  var assign$1 = assign;

  function _extends() {
    _extends = assign$1 || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  _export(_export.S, 'Object', { create: _objectCreate });

  var $Object = _core.Object;
  var create = function create(P, D) {
    return $Object.create(P, D);
  };

  var create$1 = create;

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = create$1(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function symbolObservablePonyfill(root) {
    var result;
    var Symbol = root.Symbol;

    if (typeof Symbol === 'function') {
      if (Symbol.observable) {
        result = Symbol.observable;
      } else {
        result = Symbol('observable');
        Symbol.observable = result;
      }
    } else {
      result = '@@observable';
    }

    return result;
  }

  /* global window */

  var root;

  if (typeof self !== 'undefined') {
    root = self;
  } else if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof module !== 'undefined') {
    root = module;
  } else {
    root = Function('return this')();
  }

  var result = symbolObservablePonyfill(root);

  /**
   * These are private action types reserved by Redux.
   * For any unknown actions, you must return the current state.
   * If the current state is undefined, you must return the initial state.
   * Do not reference these action types directly in your code.
   */
  var randomString = function randomString() {
    return Math.random().toString(36).substring(7).split('').join('.');
  };

  var ActionTypes = {
    INIT: "@@redux/INIT" + randomString(),
    REPLACE: "@@redux/REPLACE" + randomString(),
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return "@@redux/PROBE_UNKNOWN_ACTION" + randomString();
    }
  };

  /**
   * @param {any} obj The object to inspect.
   * @returns {boolean} True if the argument appears to be a plain object.
   */
  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }

  /**
   * Creates a Redux store that holds the state tree.
   * The only way to change the data in the store is to call `dispatch()` on it.
   *
   * There should only be a single store in your app. To specify how different
   * parts of the state tree respond to actions, you may combine several reducers
   * into a single reducer function by using `combineReducers`.
   *
   * @param {Function} reducer A function that returns the next state tree, given
   * the current state tree and the action to handle.
   *
   * @param {any} [preloadedState] The initial state. You may optionally specify it
   * to hydrate the state from the server in universal apps, or to restore a
   * previously serialized user session.
   * If you use `combineReducers` to produce the root reducer function, this must be
   * an object with the same shape as `combineReducers` keys.
   *
   * @param {Function} [enhancer] The store enhancer. You may optionally specify it
   * to enhance the store with third-party capabilities such as middleware,
   * time travel, persistence, etc. The only store enhancer that ships with Redux
   * is `applyMiddleware()`.
   *
   * @returns {Store} A Redux store that lets you read the state, dispatch actions
   * and subscribe to changes.
   */

  function createStore(reducer, preloadedState, enhancer) {
    var _ref2;

    if (typeof preloadedState === 'function' && typeof enhancer === 'function' || typeof enhancer === 'function' && typeof arguments[3] === 'function') {
      throw new Error('It looks like you are passing several store enhancers to ' + 'createStore(). This is not supported. Instead, compose them ' + 'together to a single function');
    }

    if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error('Expected the enhancer to be a function.');
      }

      return enhancer(createStore)(reducer, preloadedState);
    }

    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.');
    }

    var currentReducer = reducer;
    var currentState = preloadedState;
    var currentListeners = [];
    var nextListeners = currentListeners;
    var isDispatching = false;

    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
    }
    /**
     * Reads the state tree managed by the store.
     *
     * @returns {any} The current state tree of your application.
     */


    function getState() {
      if (isDispatching) {
        throw new Error('You may not call store.getState() while the reducer is executing. ' + 'The reducer has already received the state as an argument. ' + 'Pass it down from the top reducer instead of reading it from the store.');
      }

      return currentState;
    }
    /**
     * Adds a change listener. It will be called any time an action is dispatched,
     * and some part of the state tree may potentially have changed. You may then
     * call `getState()` to read the current state tree inside the callback.
     *
     * You may call `dispatch()` from a change listener, with the following
     * caveats:
     *
     * 1. The subscriptions are snapshotted just before every `dispatch()` call.
     * If you subscribe or unsubscribe while the listeners are being invoked, this
     * will not have any effect on the `dispatch()` that is currently in progress.
     * However, the next `dispatch()` call, whether nested or not, will use a more
     * recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all state changes, as the state
     * might have been updated multiple times during a nested `dispatch()` before
     * the listener is called. It is, however, guaranteed that all subscribers
     * registered before the `dispatch()` started will be called with the latest
     * state by the time it exits.
     *
     * @param {Function} listener A callback to be invoked on every dispatch.
     * @returns {Function} A function to remove this change listener.
     */


    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error('Expected the listener to be a function.');
      }

      if (isDispatching) {
        throw new Error('You may not call store.subscribe() while the reducer is executing. ' + 'If you would like to be notified after the store has been updated, subscribe from a ' + 'component and invoke store.getState() in the callback to access the latest state. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
      }

      var isSubscribed = true;
      ensureCanMutateNextListeners();
      nextListeners.push(listener);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ' + 'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.');
        }

        isSubscribed = false;
        ensureCanMutateNextListeners();
        var index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
      };
    }
    /**
     * Dispatches an action. It is the only way to trigger a state change.
     *
     * The `reducer` function, used to create the store, will be called with the
     * current state tree and the given `action`. Its return value will
     * be considered the **next** state of the tree, and the change listeners
     * will be notified.
     *
     * The base implementation only supports plain object actions. If you want to
     * dispatch a Promise, an Observable, a thunk, or something else, you need to
     * wrap your store creating function into the corresponding middleware. For
     * example, see the documentation for the `redux-thunk` package. Even the
     * middleware will eventually dispatch plain object actions using this method.
     *
     * @param {Object} action A plain object representing “what changed”. It is
     * a good idea to keep actions serializable so you can record and replay user
     * sessions, or use the time travelling `redux-devtools`. An action must have
     * a `type` property which may not be `undefined`. It is a good idea to use
     * string constants for action types.
     *
     * @returns {Object} For convenience, the same action object you dispatched.
     *
     * Note that, if you use a custom middleware, it may wrap `dispatch()` to
     * return something else (for example, a Promise you can await).
     */


    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
      }

      if (typeof action.type === 'undefined') {
        throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
      }

      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      var listeners = currentListeners = nextListeners;

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }

      return action;
    }
    /**
     * Replaces the reducer currently used by the store to calculate the state.
     *
     * You might need this if your app implements code splitting and you want to
     * load some of the reducers dynamically. You might also need this if you
     * implement a hot reloading mechanism for Redux.
     *
     * @param {Function} nextReducer The reducer for the store to use instead.
     * @returns {void}
     */


    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== 'function') {
        throw new Error('Expected the nextReducer to be a function.');
      }

      currentReducer = nextReducer;
      dispatch({
        type: ActionTypes.REPLACE
      });
    }
    /**
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */


    function observable() {
      var _ref;

      var outerSubscribe = subscribe;
      return _ref = {
        /**
         * The minimal observable subscription method.
         * @param {Object} observer Any object that can be used as an observer.
         * The observer object should have a `next` method.
         * @returns {subscription} An object with an `unsubscribe` method that can
         * be used to unsubscribe the observable from the store, and prevent further
         * emission of values from the observable.
         */
        subscribe: function subscribe(observer) {
          if (typeof observer !== 'object' || observer === null) {
            throw new TypeError('Expected the observer to be an object.');
          }

          function observeState() {
            if (observer.next) {
              observer.next(getState());
            }
          }

          observeState();
          var unsubscribe = outerSubscribe(observeState);
          return {
            unsubscribe: unsubscribe
          };
        }
      }, _ref[result] = function () {
        return this;
      }, _ref;
    } // When a store is created, an "INIT" action is dispatched so that every
    // reducer returns their initial state. This effectively populates
    // the initial state tree.


    dispatch({
      type: ActionTypes.INIT
    });
    return _ref2 = {
      dispatch: dispatch,
      subscribe: subscribe,
      getState: getState,
      replaceReducer: replaceReducer
    }, _ref2[result] = observable, _ref2;
  }

  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */
  function warning(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */


    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
    } catch (e) {} // eslint-disable-line no-empty

  }

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      return dispatch(actionCreator.apply(this, arguments));
    };
  }
  /**
   * Turns an object whose values are action creators, into an object with the
   * same keys, but with every function wrapped into a `dispatch` call so they
   * may be invoked directly. This is just a convenience method, as you can call
   * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
   *
   * For convenience, you can also pass a single function as the first argument,
   * and get a function in return.
   *
   * @param {Function|Object} actionCreators An object whose values are action
   * creator functions. One handy way to obtain it is to use ES6 `import * as`
   * syntax. You may also pass a single function.
   *
   * @param {Function} dispatch The `dispatch` function available on your Redux
   * store.
   *
   * @returns {Function|Object} The object mimicking the original object, but with
   * every action creator wrapped into the `dispatch` call. If you passed a
   * function as `actionCreators`, the return value will also be a single
   * function.
   */


  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
      throw new Error("bindActionCreators expected an object or a function, instead received " + (actionCreators === null ? 'null' : typeof actionCreators) + ". " + "Did you write \"import ActionCreators from\" instead of \"import * as ActionCreators from\"?");
    }

    var keys = Object.keys(actionCreators);
    var boundActionCreators = {};

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var actionCreator = actionCreators[key];

      if (typeof actionCreator === 'function') {
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
      }
    }

    return boundActionCreators;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  /**
   * Composes single-argument functions from right to left. The rightmost
   * function can take multiple arguments as it provides the signature for
   * the resulting composite function.
   *
   * @param {...Function} funcs The functions to compose.
   * @returns {Function} A function obtained by composing the argument functions
   * from right to left. For example, compose(f, g, h) is identical to doing
   * (...args) => f(g(h(...args))).
   */
  function compose() {
    for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
      funcs[_key] = arguments[_key];
    }

    if (funcs.length === 0) {
      return function (arg) {
        return arg;
      };
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce(function (a, b) {
      return function () {
        return a(b.apply(void 0, arguments));
      };
    });
  }

  /**
   * Creates a store enhancer that applies middleware to the dispatch method
   * of the Redux store. This is handy for a variety of tasks, such as expressing
   * asynchronous actions in a concise manner, or logging every action payload.
   *
   * See `redux-thunk` package as an example of the Redux middleware.
   *
   * Because middleware is potentially asynchronous, this should be the first
   * store enhancer in the composition chain.
   *
   * Note that each middleware will be given the `dispatch` and `getState` functions
   * as named arguments.
   *
   * @param {...Function} middlewares The middleware chain to be applied.
   * @returns {Function} A store enhancer applying the middleware.
   */

  function applyMiddleware() {
    for (var _len = arguments.length, middlewares = new Array(_len), _key = 0; _key < _len; _key++) {
      middlewares[_key] = arguments[_key];
    }

    return function (createStore) {
      return function () {
        var store = createStore.apply(void 0, arguments);

        var _dispatch = function dispatch() {
          throw new Error("Dispatching while constructing your middleware is not allowed. " + "Other middleware would not be applied to this dispatch.");
        };

        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch() {
            return _dispatch.apply(void 0, arguments);
          }
        };
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        _dispatch = compose.apply(void 0, chain)(store.dispatch);
        return _objectSpread({}, store, {
          dispatch: _dispatch
        });
      };
    };
  }

  /*
	 * This is a dummy function to check if the function name has been altered by minification.
	 * If the function has been minified and NODE_ENV !== 'production', warn the user.
	 */

  function isCrushed() {}

  if (typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
    warning('You are currently using minified code outside of NODE_ENV === "production". ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' + 'to ensure you have the correct code for your production build.');
  }

  var prefix = 'Invariant failed';
  function invariant(condition, message) {
    if (condition) {
      return;
    }

    {
      throw new Error(prefix + ": " + (message || ''));
    }
  }

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   *
   */

  function makeEmptyFunction(arg) {
    return function () {
      return arg;
    };
  }

  /**
   * This function accepts and discards inputs; it has no side effects. This is
   * primarily useful idiomatically for overridable function endpoints which
   * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
   */
  var emptyFunction = function emptyFunction() {};

  emptyFunction.thatReturns = makeEmptyFunction;
  emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
  emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
  emptyFunction.thatReturnsNull = makeEmptyFunction(null);
  emptyFunction.thatReturnsThis = function () {
    return this;
  };
  emptyFunction.thatReturnsArgument = function (arg) {
    return arg;
  };

  var emptyFunction_1 = emptyFunction;

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *
   */

  /**
   * Use invariant() to assert state which your program assumes to be true.
   *
   * Provide sprintf-style format (only %s is supported) and arguments
   * to provide information about what broke and what you were
   * expecting.
   *
   * The invariant message will be stripped in production, but the invariant
   * will remain to ensure logic does not differ in production.
   */

  var validateFormat = function validateFormat(format) {};

  {
    validateFormat = function validateFormat(format) {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    };
  }

  function invariant$1(condition, format, a, b, c, d, e, f) {
    validateFormat(format);

    if (!condition) {
      var error;
      if (format === undefined) {
        error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        error = new Error(format.replace(/%s/g, function () {
          return args[argIndex++];
        }));
        error.name = 'Invariant Violation';
      }

      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    }
  }

  var invariant_1 = invariant$1;

  /**
   * Similar to invariant but only logs a warning if the condition is not met.
   * This can be used to log issues in development environments in critical
   * paths. Removing the logging code for production environments will keep the
   * same logic and follow the same code paths.
   */

  var warning$1 = emptyFunction_1;

  {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning$1 = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  }

  var warning_1 = warning$1;

  /*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;

  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }

    return Object(val);
  }

  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      }

      // Detect buggy property enumeration order in older V8 versions.

      // https://bugs.chromium.org/p/v8/issues/detail?id=4118
      var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
      test1[5] = 'de';
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      }

      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test2 = {};
      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i;
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        return test2[n];
      });
      if (order2.join('') !== '0123456789') {
        return false;
      }

      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test3 = {};
      'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        test3[letter] = letter;
      });
      if (Object.keys(Object.assign({}, test3)).join('') !==
        'abcdefghijklmnopqrst') {
        return false;
      }

      return true;
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false;
    }
  }

  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;

    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);

      for (var key in from) {
        if (hasOwnProperty$1.call(from, key)) {
          to[key] = from[key];
        }
      }

      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }

    return to;
  };

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

  var ReactPropTypesSecret_1 = ReactPropTypesSecret;

  {
    var invariant$2 = invariant_1;
    var warning$2 = warning_1;
    var ReactPropTypesSecret$1 = ReactPropTypesSecret_1;
    var loggedTypeFailures = {};
  }

  /**
   * Assert that the values match with the type specs.
   * Error messages are memorized and will only be shown once.
   *
   * @param {object} typeSpecs Map of name to a ReactPropType
   * @param {object} values Runtime values that need to be type-checked
   * @param {string} location e.g. "prop", "context", "child context"
   * @param {string} componentName Name of the component for error messages.
   * @param {?Function} getStack Returns the component stack.
   * @private
   */
  function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
    {
      for (var typeSpecName in typeSpecs) {
        if (typeSpecs.hasOwnProperty(typeSpecName)) {
          var error;
          // Prop type validation may throw. In case they do, we don't want to
          // fail the render phase where it didn't fail before. So we log it.
          // After these have been cleaned up, we'll let them throw.
          try {
            // This is intentionally an invariant that gets caught. It's the same
            // behavior as without this statement except with a better message.
            invariant$2(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'the `prop-types` package, but received `%s`.', componentName || 'React class', location, typeSpecName, typeof typeSpecs[typeSpecName]);
            error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret$1);
          } catch (ex) {
            error = ex;
          }
          warning$2(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
          if (error instanceof Error && !(error.message in loggedTypeFailures)) {
            // Only monitor this failure once because there tends to be a lot of the
            // same error.
            loggedTypeFailures[error.message] = true;

            var stack = getStack ? getStack() : '';

            warning$2(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
          }
        }
      }
    }
  }

  var checkPropTypes_1 = checkPropTypes;

  var factoryWithTypeCheckers = function(isValidElement, throwOnDirectAccess) {
    /* global Symbol */
    var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
    var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

    /**
     * Returns the iterator method function contained on the iterable object.
     *
     * Be sure to invoke the function with the iterable as context:
     *
     *     var iteratorFn = getIteratorFn(myIterable);
     *     if (iteratorFn) {
     *       var iterator = iteratorFn.call(myIterable);
     *       ...
     *     }
     *
     * @param {?object} maybeIterable
     * @return {?function}
     */
    function getIteratorFn(maybeIterable) {
      var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
      if (typeof iteratorFn === 'function') {
        return iteratorFn;
      }
    }

    /**
     * Collection of methods that allow declaration and validation of props that are
     * supplied to React components. Example usage:
     *
     *   var Props = require('ReactPropTypes');
     *   var MyArticle = React.createClass({
     *     propTypes: {
     *       // An optional string prop named "description".
     *       description: Props.string,
     *
     *       // A required enum prop named "category".
     *       category: Props.oneOf(['News','Photos']).isRequired,
     *
     *       // A prop named "dialog" that requires an instance of Dialog.
     *       dialog: Props.instanceOf(Dialog).isRequired
     *     },
     *     render: function() { ... }
     *   });
     *
     * A more formal specification of how these methods are used:
     *
     *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
     *   decl := ReactPropTypes.{type}(.isRequired)?
     *
     * Each and every declaration produces a function with the same signature. This
     * allows the creation of custom validation functions. For example:
     *
     *  var MyLink = React.createClass({
     *    propTypes: {
     *      // An optional string or URI prop named "href".
     *      href: function(props, propName, componentName) {
     *        var propValue = props[propName];
     *        if (propValue != null && typeof propValue !== 'string' &&
     *            !(propValue instanceof URI)) {
     *          return new Error(
     *            'Expected a string or an URI for ' + propName + ' in ' +
     *            componentName
     *          );
     *        }
     *      }
     *    },
     *    render: function() {...}
     *  });
     *
     * @internal
     */

    var ANONYMOUS = '<<anonymous>>';

    // Important!
    // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
    var ReactPropTypes = {
      array: createPrimitiveTypeChecker('array'),
      bool: createPrimitiveTypeChecker('boolean'),
      func: createPrimitiveTypeChecker('function'),
      number: createPrimitiveTypeChecker('number'),
      object: createPrimitiveTypeChecker('object'),
      string: createPrimitiveTypeChecker('string'),
      symbol: createPrimitiveTypeChecker('symbol'),

      any: createAnyTypeChecker(),
      arrayOf: createArrayOfTypeChecker,
      element: createElementTypeChecker(),
      instanceOf: createInstanceTypeChecker,
      node: createNodeChecker(),
      objectOf: createObjectOfTypeChecker,
      oneOf: createEnumTypeChecker,
      oneOfType: createUnionTypeChecker,
      shape: createShapeTypeChecker,
      exact: createStrictShapeTypeChecker,
    };

    /**
     * inlined Object.is polyfill to avoid requiring consumers ship their own
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
     */
    /*eslint-disable no-self-compare*/
    function is(x, y) {
      // SameValue algorithm
      if (x === y) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
      } else {
        // Step 6.a: NaN == NaN
        return x !== x && y !== y;
      }
    }
    /*eslint-enable no-self-compare*/

    /**
     * We use an Error-like object for backward compatibility as people may call
     * PropTypes directly and inspect their output. However, we don't use real
     * Errors anymore. We don't inspect their stack anyway, and creating them
     * is prohibitively expensive if they are created too often, such as what
     * happens in oneOfType() for any type before the one that matched.
     */
    function PropTypeError(message) {
      this.message = message;
      this.stack = '';
    }
    // Make `instanceof Error` still work for returned errors.
    PropTypeError.prototype = Error.prototype;

    function createChainableTypeChecker(validate) {
      {
        var manualPropTypeCallCache = {};
        var manualPropTypeWarningCount = 0;
      }
      function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
        componentName = componentName || ANONYMOUS;
        propFullName = propFullName || propName;

        if (secret !== ReactPropTypesSecret_1) {
          if (throwOnDirectAccess) {
            // New behavior only for users of `prop-types` package
            invariant_1(
              false,
              'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
              'Use `PropTypes.checkPropTypes()` to call them. ' +
              'Read more at http://fb.me/use-check-prop-types'
            );
          } else if (typeof console !== 'undefined') {
            // Old behavior for people using React.PropTypes
            var cacheKey = componentName + ':' + propName;
            if (
              !manualPropTypeCallCache[cacheKey] &&
              // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3
            ) {
              warning_1(
                false,
                'You are manually calling a React.PropTypes validation ' +
                'function for the `%s` prop on `%s`. This is deprecated ' +
                'and will throw in the standalone `prop-types` package. ' +
                'You may be seeing this warning due to a third-party PropTypes ' +
                'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
                propFullName,
                componentName
              );
              manualPropTypeCallCache[cacheKey] = true;
              manualPropTypeWarningCount++;
            }
          }
        }
        if (props[propName] == null) {
          if (isRequired) {
            if (props[propName] === null) {
              return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
            }
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
          }
          return null;
        } else {
          return validate(props, propName, componentName, location, propFullName);
        }
      }

      var chainedCheckType = checkType.bind(null, false);
      chainedCheckType.isRequired = checkType.bind(null, true);

      return chainedCheckType;
    }

    function createPrimitiveTypeChecker(expectedType) {
      function validate(props, propName, componentName, location, propFullName, secret) {
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== expectedType) {
          // `propValue` being instance of, say, date/regexp, pass the 'object'
          // check, but we can offer a more precise error message here rather than
          // 'of type `object`'.
          var preciseType = getPreciseType(propValue);

          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createAnyTypeChecker() {
      return createChainableTypeChecker(emptyFunction_1.thatReturnsNull);
    }

    function createArrayOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
        }
        var propValue = props[propName];
        if (!Array.isArray(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
        }
        for (var i = 0; i < propValue.length; i++) {
          var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);
          if (error instanceof Error) {
            return error;
          }
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createElementTypeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        if (!isValidElement(propValue)) {
          var propType = getPropType(propValue);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createInstanceTypeChecker(expectedClass) {
      function validate(props, propName, componentName, location, propFullName) {
        if (!(props[propName] instanceof expectedClass)) {
          var expectedClassName = expectedClass.name || ANONYMOUS;
          var actualClassName = getClassName(props[propName]);
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createEnumTypeChecker(expectedValues) {
      if (!Array.isArray(expectedValues)) {
        warning_1(false, 'Invalid argument supplied to oneOf, expected an instance of array.');
        return emptyFunction_1.thatReturnsNull;
      }

      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        for (var i = 0; i < expectedValues.length; i++) {
          if (is(propValue, expectedValues[i])) {
            return null;
          }
        }

        var valuesString = JSON.stringify(expectedValues);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
      }
      return createChainableTypeChecker(validate);
    }

    function createObjectOfTypeChecker(typeChecker) {
      function validate(props, propName, componentName, location, propFullName) {
        if (typeof typeChecker !== 'function') {
          return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
        }
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
        }
        for (var key in propValue) {
          if (propValue.hasOwnProperty(key)) {
            var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
            if (error instanceof Error) {
              return error;
            }
          }
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createUnionTypeChecker(arrayOfTypeCheckers) {
      if (!Array.isArray(arrayOfTypeCheckers)) {
        warning_1(false, 'Invalid argument supplied to oneOfType, expected an instance of array.');
        return emptyFunction_1.thatReturnsNull;
      }

      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (typeof checker !== 'function') {
          warning_1(
            false,
            'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
            'received %s at index %s.',
            getPostfixForTypeWarning(checker),
            i
          );
          return emptyFunction_1.thatReturnsNull;
        }
      }

      function validate(props, propName, componentName, location, propFullName) {
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1) == null) {
            return null;
          }
        }

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
      }
      return createChainableTypeChecker(validate);
    }

    function createNodeChecker() {
      function validate(props, propName, componentName, location, propFullName) {
        if (!isNode(props[propName])) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }
        for (var key in shapeTypes) {
          var checker = shapeTypes[key];
          if (!checker) {
            continue;
          }
          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
          if (error) {
            return error;
          }
        }
        return null;
      }
      return createChainableTypeChecker(validate);
    }

    function createStrictShapeTypeChecker(shapeTypes) {
      function validate(props, propName, componentName, location, propFullName) {
        var propValue = props[propName];
        var propType = getPropType(propValue);
        if (propType !== 'object') {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
        }
        // We need to check all keys in case some are required but missing from
        // props.
        var allKeys = objectAssign({}, props[propName], shapeTypes);
        for (var key in allKeys) {
          var checker = shapeTypes[key];
          if (!checker) {
            return new PropTypeError(
              'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
              '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
              '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
            );
          }
          var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);
          if (error) {
            return error;
          }
        }
        return null;
      }

      return createChainableTypeChecker(validate);
    }

    function isNode(propValue) {
      switch (typeof propValue) {
        case 'number':
        case 'string':
        case 'undefined':
          return true;
        case 'boolean':
          return !propValue;
        case 'object':
          if (Array.isArray(propValue)) {
            return propValue.every(isNode);
          }
          if (propValue === null || isValidElement(propValue)) {
            return true;
          }

          var iteratorFn = getIteratorFn(propValue);
          if (iteratorFn) {
            var iterator = iteratorFn.call(propValue);
            var step;
            if (iteratorFn !== propValue.entries) {
              while (!(step = iterator.next()).done) {
                if (!isNode(step.value)) {
                  return false;
                }
              }
            } else {
              // Iterator will provide entry [k,v] tuples rather than values.
              while (!(step = iterator.next()).done) {
                var entry = step.value;
                if (entry) {
                  if (!isNode(entry[1])) {
                    return false;
                  }
                }
              }
            }
          } else {
            return false;
          }

          return true;
        default:
          return false;
      }
    }

    function isSymbol(propType, propValue) {
      // Native Symbol.
      if (propType === 'symbol') {
        return true;
      }

      // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
      if (propValue['@@toStringTag'] === 'Symbol') {
        return true;
      }

      // Fallback for non-spec compliant Symbols which are polyfilled.
      if (typeof Symbol === 'function' && propValue instanceof Symbol) {
        return true;
      }

      return false;
    }

    // Equivalent of `typeof` but with special handling for array and regexp.
    function getPropType(propValue) {
      var propType = typeof propValue;
      if (Array.isArray(propValue)) {
        return 'array';
      }
      if (propValue instanceof RegExp) {
        // Old webkits (at least until Android 4.0) return 'function' rather than
        // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
        // passes PropTypes.object.
        return 'object';
      }
      if (isSymbol(propType, propValue)) {
        return 'symbol';
      }
      return propType;
    }

    // This handles more types than `getPropType`. Only used for error messages.
    // See `createPrimitiveTypeChecker`.
    function getPreciseType(propValue) {
      if (typeof propValue === 'undefined' || propValue === null) {
        return '' + propValue;
      }
      var propType = getPropType(propValue);
      if (propType === 'object') {
        if (propValue instanceof Date) {
          return 'date';
        } else if (propValue instanceof RegExp) {
          return 'regexp';
        }
      }
      return propType;
    }

    // Returns a string that is postfixed to a warning about an invalid type.
    // For example, "undefined" or "of type array"
    function getPostfixForTypeWarning(value) {
      var type = getPreciseType(value);
      switch (type) {
        case 'array':
        case 'object':
          return 'an ' + type;
        case 'boolean':
        case 'date':
        case 'regexp':
          return 'a ' + type;
        default:
          return type;
      }
    }

    // Returns class name of the object, if any.
    function getClassName(propValue) {
      if (!propValue.constructor || !propValue.constructor.name) {
        return ANONYMOUS;
      }
      return propValue.constructor.name;
    }

    ReactPropTypes.checkPropTypes = checkPropTypes_1;
    ReactPropTypes.PropTypes = ReactPropTypes;

    return ReactPropTypes;
  };

  var propTypes = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    {
      var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
        Symbol.for &&
        Symbol.for('react.element')) ||
        0xeac7;

      var isValidElement = function(object) {
        return typeof object === 'object' &&
          object !== null &&
          object.$$typeof === REACT_ELEMENT_TYPE;
      };

      // By explicitly using `prop-types` you are opting into new development behavior.
      // http://fb.me/prop-types-in-prod
      var throwOnDirectAccess = true;
      module.exports = factoryWithTypeCheckers(isValidElement, throwOnDirectAccess);
    }
  });

  var origin = {
    x: 0,
    y: 0
  };
  var add = function add(point1, point2) {
    return {
      x: point1.x + point2.x,
      y: point1.y + point2.y
    };
  };
  var subtract = function subtract(point1, point2) {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y
    };
  };
  var isEqual = function isEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
  };
  var negate = function negate(point) {
    return {
      x: point.x !== 0 ? -point.x : 0,
      y: point.y !== 0 ? -point.y : 0
    };
  };
  var patch = function patch(line, value, otherValue) {
    var _ref;

    if (otherValue === void 0) {
      otherValue = 0;
    }

    return _ref = {}, _ref[line] = value, _ref[line === 'x' ? 'y' : 'x'] = otherValue, _ref;
  };
  var distance = function distance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
  };
  var closest = function closest(target, points) {
    return Math.min.apply(Math, points.map(function (point) {
      return distance(target, point);
    }));
  };
  var apply = function apply(fn) {
    return function (point) {
      return {
        x: fn(point.x),
        y: fn(point.y)
      };
    };
  };

  var getRect = function getRect(_ref) {
    var top = _ref.top,
      right = _ref.right,
      bottom = _ref.bottom,
      left = _ref.left;
    var width = right - left;
    var height = bottom - top;
    var rect = {
      top: top,
      right: right,
      bottom: bottom,
      left: left,
      width: width,
      height: height,
      x: left,
      y: top,
      center: {
        x: (right + left) / 2,
        y: (bottom + top) / 2
      }
    };
    return rect;
  };
  var expand = function expand(target, expandBy) {
    return {
      top: target.top - expandBy.top,
      left: target.left - expandBy.left,
      bottom: target.bottom + expandBy.bottom,
      right: target.right + expandBy.right
    };
  };
  var shrink = function shrink(target, shrinkBy) {
    return {
      top: target.top + shrinkBy.top,
      left: target.left + shrinkBy.left,
      bottom: target.bottom - shrinkBy.bottom,
      right: target.right - shrinkBy.right
    };
  };

  var shift = function shift(target, shiftBy) {
    return {
      top: target.top + shiftBy.y,
      left: target.left + shiftBy.x,
      bottom: target.bottom + shiftBy.y,
      right: target.right + shiftBy.x
    };
  };

  var noSpacing = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
  var createBox = function createBox(_ref2) {
    var borderBox = _ref2.borderBox,
      _ref2$margin = _ref2.margin,
      margin = _ref2$margin === void 0 ? noSpacing : _ref2$margin,
      _ref2$border = _ref2.border,
      border = _ref2$border === void 0 ? noSpacing : _ref2$border,
      _ref2$padding = _ref2.padding,
      padding = _ref2$padding === void 0 ? noSpacing : _ref2$padding;
    var marginBox = getRect(expand(borderBox, margin));
    var paddingBox = getRect(shrink(borderBox, border));
    var contentBox = getRect(shrink(paddingBox, padding));
    return {
      marginBox: marginBox,
      borderBox: getRect(borderBox),
      paddingBox: paddingBox,
      contentBox: contentBox,
      margin: margin,
      border: border,
      padding: padding
    };
  };

  var parse = function parse(raw) {
    var value = raw.slice(0, -2);
    var suffix = raw.slice(-2);
    !(suffix === 'px') ? invariant(false, "Expected value to be a pixel value.\n      Expected form: 10px\n      Actual value: " + raw + "\n    ") : void 0;
    var result = Number(value);
    !!isNaN(result) ? invariant(false, "Could not parse value [raw: " + raw + ", without suffix: " + value + "]") : void 0;
    return result;
  };

  var getWindowScroll = function getWindowScroll() {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  };

  var offset = function offset(original, change) {
    var borderBox = original.borderBox,
      border = original.border,
      margin = original.margin,
      padding = original.padding;
    var shifted = shift(borderBox, change);
    return createBox({
      borderBox: shifted,
      border: border,
      margin: margin,
      padding: padding
    });
  };
  var withScroll = function withScroll(original, scroll) {
    if (scroll === void 0) {
      scroll = getWindowScroll();
    }

    return offset(original, scroll);
  };
  var calculateBox = function calculateBox(borderBox, styles) {
    var margin = {
      top: parse(styles.marginTop),
      right: parse(styles.marginRight),
      bottom: parse(styles.marginBottom),
      left: parse(styles.marginLeft)
    };
    var padding = {
      top: parse(styles.paddingTop),
      right: parse(styles.paddingRight),
      bottom: parse(styles.paddingBottom),
      left: parse(styles.paddingLeft)
    };
    var border = {
      top: parse(styles.borderTopWidth),
      right: parse(styles.borderRightWidth),
      bottom: parse(styles.borderBottomWidth),
      left: parse(styles.borderLeftWidth)
    };
    return createBox({
      borderBox: borderBox,
      margin: margin,
      padding: padding,
      border: border
    });
  };
  var getBox = function getBox(el) {
    var borderBox = el.getBoundingClientRect();
    var styles = window.getComputedStyle(el);
    return calculateBox(borderBox, styles);
  };

  var executeClip = (function (frame, subject) {
    var result = getRect({
      top: Math.max(subject.top, frame.top),
      right: Math.min(subject.right, frame.right),
      bottom: Math.min(subject.bottom, frame.bottom),
      left: Math.max(subject.left, frame.left)
    });

    if (result.width <= 0 || result.height <= 0) {
      return null;
    }

    return result;
  });

  var isEqual$1 = function isEqual(first, second) {
    return first.top === second.top && first.right === second.right && first.bottom === second.bottom && first.left === second.left;
  };
  var offsetByPosition = function offsetByPosition(spacing, point) {
    return {
      top: spacing.top + point.y,
      left: spacing.left + point.x,
      bottom: spacing.bottom + point.y,
      right: spacing.right + point.x
    };
  };
  var getCorners = function getCorners(spacing) {
    return [{
      x: spacing.left,
      y: spacing.top
    }, {
      x: spacing.right,
      y: spacing.top
    }, {
      x: spacing.left,
      y: spacing.bottom
    }, {
      x: spacing.right,
      y: spacing.bottom
    }];
  };

  var scroll = function scroll(target, frame) {
    if (!frame) {
      return target;
    }

    return offsetByPosition(target, frame.scroll.diff.displacement);
  };

  var increase = function increase(target, axis, withPlaceholder) {
    if (withPlaceholder && withPlaceholder.increasedBy) {
      var _extends2;

      return _extends({}, target, (_extends2 = {}, _extends2[axis.end] = target[axis.end] + withPlaceholder.increasedBy[axis.line], _extends2));
    }

    return target;
  };

  var clip = function clip(target, frame) {
    if (frame && frame.shouldClipSubject) {
      return executeClip(frame.pageMarginBox, target);
    }

    return getRect(target);
  };

  var getSubject = (function (_ref) {
    var page = _ref.page,
      withPlaceholder = _ref.withPlaceholder,
      axis = _ref.axis,
      frame = _ref.frame;
    var scrolled = scroll(page.marginBox, frame);
    var increased = increase(scrolled, axis, withPlaceholder);
    var clipped = clip(increased, frame);
    return {
      page: page,
      withPlaceholder: withPlaceholder,
      active: clipped
    };
  });

  var scrollDroppable = (function (droppable, newScroll) {
    !droppable.frame ? invariant(false) : void 0;
    var scrollable = droppable.frame;
    var scrollDiff = subtract(newScroll, scrollable.scroll.initial);
    var scrollDisplacement = negate(scrollDiff);

    var frame = _extends({}, scrollable, {
      scroll: {
        initial: scrollable.scroll.initial,
        current: newScroll,
        diff: {
          value: scrollDiff,
          displacement: scrollDisplacement
        },
        max: scrollable.scroll.max
      }
    });

    var subject = getSubject({
      page: droppable.subject.page,
      withPlaceholder: droppable.subject.withPlaceholder,
      axis: droppable.axis,
      frame: frame
    });

    var result = _extends({}, droppable, {
      frame: frame,
      subject: subject
    });

    return result;
  });

  var records = {};
  var isEnabled = false;

  var isTimingsEnabled = function isTimingsEnabled() {
    return isEnabled;
  };
  var start = function start(key) {
    {
      if (!isTimingsEnabled()) {
        return;
      }

      var now = performance.now();
      records[key] = now;
    }
  };
  var finish = function finish(key) {
    {
      if (!isTimingsEnabled()) {
        return;
      }

      var now = performance.now();
      var previous = records[key];

      if (!previous) {
        console.warn('cannot finish timing as no previous time found', key);
        return;
      }

      var result = now - previous;
      var rounded = result.toFixed(2);

      var style = function () {
        if (result < 12) {
          return {
            textColor: 'green',
            symbol: '✅'
          };
        }

        if (result < 40) {
          return {
            textColor: 'orange',
            symbol: '⚠️'
          };
        }

        return {
          textColor: 'red',
          symbol: '❌'
        };
      }();

      console.log(style.symbol + " %cTiming %c" + rounded + " %cms %c" + key, 'color: blue; font-weight: bold;', "color: " + style.textColor + "; font-size: 1.1em;", 'color: grey;', 'color: purple; font-weight: bold;');
    }
  };

  var shallowEqual = function shallowEqual(newValue, oldValue) {
    return newValue === oldValue;
  };

  var simpleIsEqual = function simpleIsEqual(newArgs, lastArgs) {
    return newArgs.length === lastArgs.length && newArgs.every(function (newArg, index) {
      return shallowEqual(newArg, lastArgs[index]);
    });
  };

  function index (resultFn, isEqual) {
    if (isEqual === void 0) {
      isEqual = simpleIsEqual;
    }

    var lastThis;
    var lastArgs = [];
    var lastResult;
    var calledOnce = false;

    var result = function result() {
      for (var _len = arguments.length, newArgs = new Array(_len), _key = 0; _key < _len; _key++) {
        newArgs[_key] = arguments[_key];
      }

      if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
        return lastResult;
      }

      lastResult = resultFn.apply(this, newArgs);
      calledOnce = true;
      lastThis = this;
      lastArgs = newArgs;
      return lastResult;
    };

    return result;
  }

  var isEnum = _objectPie.f;
  var _objectToArray = function (isEntries) {
    return function (it) {
      var O = _toIobject(it);
      var keys = _objectKeys(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;
      while (length > i) if (isEnum.call(O, key = keys[i++])) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      } return result;
    };
  };

  // https://github.com/tc39/proposal-object-values-entries

  var $values = _objectToArray(false);

  _export(_export.S, 'Object', {
    values: function values(it) {
      return $values(it);
    }
  });

  var values = _core.Object.values;

  var values$1 = values;

  function values$2(map) {
    return values$1(map);
  }
  function findIndex(list, predicate) {
    if (list.findIndex) {
      return list.findIndex(predicate);
    }

    for (var i = 0; i < list.length; i++) {
      if (predicate(list[i])) {
        return i;
      }
    }

    return -1;
  }
  function find(list, predicate) {
    if (list.find) {
      return list.find(predicate);
    }

    var index = findIndex(list, predicate);

    if (index !== -1) {
      return list[index];
    }

    return undefined;
  }

  var toDroppableMap = index(function (droppables) {
    return droppables.reduce(function (previous, current) {
      previous[current.descriptor.id] = current;
      return previous;
    }, {});
  });
  var toDraggableMap = index(function (draggables) {
    return draggables.reduce(function (previous, current) {
      previous[current.descriptor.id] = current;
      return previous;
    }, {});
  });
  var toDroppableList = index(function (droppables) {
    return values$2(droppables);
  });
  var toDraggableList = index(function (draggables) {
    return values$2(draggables);
  });

  var isWithin = (function (lowerBound, upperBound) {
    return function (value) {
      return lowerBound <= value && value <= upperBound;
    };
  });

  var isPositionInFrame = (function (frame) {
    var isWithinVertical = isWithin(frame.top, frame.bottom);
    var isWithinHorizontal = isWithin(frame.left, frame.right);
    return function (point) {
      return isWithinVertical(point.y) && isWithinVertical(point.y) && isWithinHorizontal(point.x) && isWithinHorizontal(point.x);
    };
  });

  var getDroppableOver = (function (_ref) {
    var target = _ref.target,
      droppables = _ref.droppables;
    var maybe = find(toDroppableList(droppables), function (droppable) {
      if (!droppable.isEnabled) {
        return false;
      }

      var active = droppable.subject.active;

      if (!active) {
        return false;
      }

      return isPositionInFrame(active)(target);
    });
    return maybe ? maybe.descriptor.id : null;
  });

  var getDraggablesInsideDroppable = index(function (droppableId, draggables) {
    var result = toDraggableList(draggables).filter(function (draggable) {
      return droppableId === draggable.descriptor.droppableId;
    }).sort(function (a, b) {
      return a.descriptor.index - b.descriptor.index;
    });
    return result;
  });

  var isPartiallyVisibleThroughFrame = (function (frame) {
    var isWithinVertical = isWithin(frame.top, frame.bottom);
    var isWithinHorizontal = isWithin(frame.left, frame.right);
    return function (subject) {
      var isContained = isWithinVertical(subject.top) && isWithinVertical(subject.bottom) && isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);

      if (isContained) {
        return true;
      }

      var isPartiallyVisibleVertically = isWithinVertical(subject.top) || isWithinVertical(subject.bottom);
      var isPartiallyVisibleHorizontally = isWithinHorizontal(subject.left) || isWithinHorizontal(subject.right);
      var isPartiallyContained = isPartiallyVisibleVertically && isPartiallyVisibleHorizontally;

      if (isPartiallyContained) {
        return true;
      }

      var isBiggerVertically = subject.top < frame.top && subject.bottom > frame.bottom;
      var isBiggerHorizontally = subject.left < frame.left && subject.right > frame.right;
      var isTargetBiggerThanFrame = isBiggerVertically && isBiggerHorizontally;

      if (isTargetBiggerThanFrame) {
        return true;
      }

      var isTargetBiggerOnOneAxis = isBiggerVertically && isPartiallyVisibleHorizontally || isBiggerHorizontally && isPartiallyVisibleVertically;
      return isTargetBiggerOnOneAxis;
    };
  });

  var isTotallyVisibleThroughFrame = (function (frame) {
    var isWithinVertical = isWithin(frame.top, frame.bottom);
    var isWithinHorizontal = isWithin(frame.left, frame.right);
    return function (subject) {
      var isContained = isWithinVertical(subject.top) && isWithinVertical(subject.bottom) && isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
      return isContained;
    };
  });

  var vertical = {
    direction: 'vertical',
    line: 'y',
    crossAxisLine: 'x',
    start: 'top',
    end: 'bottom',
    size: 'height',
    crossAxisStart: 'left',
    crossAxisEnd: 'right',
    crossAxisSize: 'width'
  };
  var horizontal = {
    direction: 'horizontal',
    line: 'x',
    crossAxisLine: 'y',
    start: 'left',
    end: 'right',
    size: 'width',
    crossAxisStart: 'top',
    crossAxisEnd: 'bottom',
    crossAxisSize: 'height'
  };

  var isTotallyVisibleThroughFrameOnAxis = (function (axis) {
    return function (frame) {
      var isWithinVertical = isWithin(frame.top, frame.bottom);
      var isWithinHorizontal = isWithin(frame.left, frame.right);
      return function (subject) {
        if (axis === vertical) {
          return isWithinVertical(subject.top) && isWithinVertical(subject.bottom);
        }

        return isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
      };
    };
  });

  var getDroppableDisplaced = function getDroppableDisplaced(target, destination) {
    var displacement = destination.frame ? destination.frame.scroll.diff.displacement : origin;
    return offsetByPosition(target, displacement);
  };

  var isVisibleInDroppable = function isVisibleInDroppable(target, destination, isVisibleThroughFrameFn) {
    if (!destination.subject.active) {
      return false;
    }

    return isVisibleThroughFrameFn(destination.subject.active)(target);
  };

  var isVisibleInViewport = function isVisibleInViewport(target, viewport, isVisibleThroughFrameFn) {
    return isVisibleThroughFrameFn(viewport)(target);
  };

  var isVisible = function isVisible(_ref) {
    var toBeDisplaced = _ref.target,
      destination = _ref.destination,
      viewport = _ref.viewport,
      withDroppableDisplacement = _ref.withDroppableDisplacement,
      isVisibleThroughFrameFn = _ref.isVisibleThroughFrameFn;
    var displacedTarget = withDroppableDisplacement ? getDroppableDisplaced(toBeDisplaced, destination) : toBeDisplaced;
    return isVisibleInDroppable(displacedTarget, destination, isVisibleThroughFrameFn) && isVisibleInViewport(displacedTarget, viewport, isVisibleThroughFrameFn);
  };

  var isPartiallyVisible = function isPartiallyVisible(args) {
    return isVisible(_extends({}, args, {
      isVisibleThroughFrameFn: isPartiallyVisibleThroughFrame
    }));
  };
  var isTotallyVisible = function isTotallyVisible(args) {
    return isVisible(_extends({}, args, {
      isVisibleThroughFrameFn: isTotallyVisibleThroughFrame
    }));
  };
  var isTotallyVisibleOnAxis = function isTotallyVisibleOnAxis(args) {
    return isVisible(_extends({}, args, {
      isVisibleThroughFrameFn: isTotallyVisibleThroughFrameOnAxis(args.destination.axis)
    }));
  };

  var getShouldAnimate = function getShouldAnimate(isVisible, previous) {
    if (!isVisible) {
      return false;
    }

    if (!previous) {
      return true;
    }

    return previous.shouldAnimate;
  };

  var getDisplacement = (function (_ref) {
    var draggable = _ref.draggable,
      destination = _ref.destination,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport;
    var id = draggable.descriptor.id;
    var map = previousImpact.movement.map;
    var isVisible = isPartiallyVisible({
      target: draggable.page.marginBox,
      destination: destination,
      viewport: viewport,
      withDroppableDisplacement: true
    });
    var shouldAnimate = getShouldAnimate(isVisible, map[id]);
    var displacement = {
      draggableId: id,
      isVisible: isVisible,
      shouldAnimate: shouldAnimate
    };
    return displacement;
  });

  var getDisplacementMap = index(function (displaced) {
    return displaced.reduce(function (map, displacement) {
      map[displacement.draggableId] = displacement;
      return map;
    }, {});
  });

  var isUserMovingForward = (function (axis, direction) {
    return axis === vertical ? direction.vertical === 'down' : direction.horizontal === 'right';
  });

  var getDisplacedBy = index(function (axis, displaceBy, willDisplaceForward) {
    var modifier = willDisplaceForward ? 1 : -1;
    var displacement = displaceBy[axis.line] * modifier;
    return {
      value: displacement,
      point: patch(axis.line, displacement)
    };
  });

  var getNewIndex = function getNewIndex(startIndex, amountOfDisplaced, isInFrontOfStart) {
    if (!amountOfDisplaced) {
      return startIndex;
    }

    if (isInFrontOfStart) {
      return startIndex + amountOfDisplaced;
    }

    return startIndex - amountOfDisplaced;
  };

  var inHomeList = (function (_ref) {
    var currentCenter = _ref.pageBorderBoxCenterWithDroppableScrollChange,
      draggable = _ref.draggable,
      home = _ref.home,
      insideHome = _ref.insideHome,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport,
      currentUserDirection = _ref.userDirection;
    var axis = home.axis;
    var originalCenter = draggable.page.borderBox.center;
    var targetCenter = currentCenter[axis.line];
    var isInFrontOfStart = targetCenter > originalCenter[axis.line];
    var willDisplaceForward = !isInFrontOfStart;
    var isMovingForward = isUserMovingForward(home.axis, currentUserDirection);
    var isMovingTowardStart = isInFrontOfStart ? !isMovingForward : isMovingForward;
    var displacedBy = getDisplacedBy(home.axis, draggable.displaceBy, willDisplaceForward);
    var displacement = displacedBy.value;
    var displaced = insideHome.filter(function (child) {
      if (child === draggable) {
        return false;
      }

      var borderBox = child.page.borderBox;
      var start = borderBox[axis.start];
      var end = borderBox[axis.end];

      if (isInFrontOfStart) {
        if (child.descriptor.index < draggable.descriptor.index) {
          return false;
        }

        if (isMovingTowardStart) {
          var displacedEndEdge = end + displacement;
          return targetCenter > displacedEndEdge;
        }

        return targetCenter >= start;
      }

      if (child.descriptor.index > draggable.descriptor.index) {
        return false;
      }

      if (isMovingTowardStart) {
        var displacedStartEdge = start + displacement;
        return targetCenter < displacedStartEdge;
      }

      return targetCenter <= end;
    }).map(function (dimension) {
      return getDisplacement({
        draggable: dimension,
        destination: home,
        previousImpact: previousImpact,
        viewport: viewport.frame
      });
    });
    var ordered = isInFrontOfStart ? displaced.reverse() : displaced;
    var index = getNewIndex(draggable.descriptor.index, ordered.length, isInFrontOfStart);
    var newMovement = {
      displaced: ordered,
      map: getDisplacementMap(ordered),
      willDisplaceForward: willDisplaceForward,
      displacedBy: displacedBy
    };
    var impact = {
      movement: newMovement,
      direction: axis.direction,
      destination: {
        droppableId: home.descriptor.id,
        index: index
      },
      merge: null
    };
    return impact;
  });

  var inForeignList = (function (_ref) {
    var currentCenter = _ref.pageBorderBoxCenterWithDroppableScrollChange,
      draggable = _ref.draggable,
      destination = _ref.destination,
      insideDestination = _ref.insideDestination,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport,
      userDirection = _ref.userDirection;
    var axis = destination.axis;
    var isMovingForward = isUserMovingForward(destination.axis, userDirection);
    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy, true);
    var targetCenter = currentCenter[axis.line];
    var displacement = displacedBy.value;
    var displaced = insideDestination.filter(function (child) {
      var borderBox = child.page.borderBox;
      var start = borderBox[axis.start];
      var end = borderBox[axis.end];

      if (isMovingForward) {
        return targetCenter <= start + displacement;
      }

      return targetCenter < end;
    }).map(function (dimension) {
      return getDisplacement({
        draggable: dimension,
        destination: destination,
        previousImpact: previousImpact,
        viewport: viewport.frame
      });
    });
    var newIndex = insideDestination.length - displaced.length;
    var movement = {
      displacedBy: displacedBy,
      displaced: displaced,
      map: getDisplacementMap(displaced),
      willDisplaceForward: true
    };
    var impact = {
      movement: movement,
      direction: axis.direction,
      destination: {
        droppableId: destination.descriptor.id,
        index: newIndex
      },
      merge: null
    };
    return impact;
  });

  var noDisplacedBy = {
    point: origin,
    value: 0
  };
  var noMovement = {
    displaced: [],
    map: {},
    displacedBy: noDisplacedBy,
    willDisplaceForward: false
  };
  var noImpact = {
    movement: noMovement,
    direction: null,
    destination: null,
    merge: null
  };

  var withDroppableScroll = (function (droppable, point) {
    var frame = droppable.frame;

    if (!frame) {
      return point;
    }

    return add(point, frame.scroll.diff.value);
  });

  var isHomeOf = (function (draggable, destination) {
    return draggable.descriptor.droppableId === destination.descriptor.id;
  });

  var getWhenEntered = function getWhenEntered(id, current, oldMerge) {
    if (!oldMerge) {
      return current;
    }

    if (id !== oldMerge.combine.draggableId) {
      return current;
    }

    return oldMerge.whenEntered;
  };

  var isCombiningWith = function isCombiningWith(_ref) {
    var id = _ref.id,
      currentCenter = _ref.currentCenter,
      axis = _ref.axis,
      borderBox = _ref.borderBox,
      displacedBy = _ref.displacedBy,
      currentUserDirection = _ref.currentUserDirection,
      oldMerge = _ref.oldMerge;
    var start = borderBox[axis.start] + displacedBy;
    var end = borderBox[axis.end] + displacedBy;
    var size = borderBox[axis.size];
    var twoThirdsOfSize = size * 0.666;
    var whenEntered = getWhenEntered(id, currentUserDirection, oldMerge);
    var isMovingForward = isUserMovingForward(axis, whenEntered);
    var targetCenter = currentCenter[axis.line];

    if (isMovingForward) {
      return isWithin(start, start + twoThirdsOfSize)(targetCenter);
    }

    return isWithin(end - twoThirdsOfSize, end)(targetCenter);
  };

  var getCombineImpact = (function (_ref2) {
    var currentCenter = _ref2.pageBorderBoxCenterWithDroppableScrollChange,
      previousImpact = _ref2.previousImpact,
      draggable = _ref2.draggable,
      destination = _ref2.destination,
      insideDestination = _ref2.insideDestination,
      userDirection = _ref2.userDirection;

    if (!destination.isCombineEnabled) {
      return null;
    }

    var axis = destination.axis;
    var map = previousImpact.movement.map;
    var canBeDisplacedBy = previousImpact.movement.displacedBy.value;
    var oldMerge = previousImpact.merge;
    var target = find(insideDestination, function (child) {
      var id = child.descriptor.id;

      if (id === draggable.descriptor.id) {
        return false;
      }

      var isDisplaced = Boolean(map[id]);
      var displacedBy = isDisplaced ? canBeDisplacedBy : 0;
      return isCombiningWith({
        id: id,
        currentCenter: currentCenter,
        axis: axis,
        borderBox: child.page.borderBox,
        displacedBy: displacedBy,
        currentUserDirection: userDirection,
        oldMerge: oldMerge
      });
    });

    if (!target) {
      return null;
    }

    var merge = {
      whenEntered: getWhenEntered(target.descriptor.id, userDirection, oldMerge),
      combine: {
        draggableId: target.descriptor.id,
        droppableId: destination.descriptor.id
      }
    };

    var withMerge = _extends({}, previousImpact, {
      destination: null,
      merge: merge
    });

    return withMerge;
  });

  var getDragImpact = (function (_ref) {
    var pageBorderBoxCenter = _ref.pageBorderBoxCenter,
      draggable = _ref.draggable,
      draggables = _ref.draggables,
      droppables = _ref.droppables,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport,
      userDirection = _ref.userDirection;
    var destinationId = getDroppableOver({
      target: pageBorderBoxCenter,
      droppables: droppables
    });

    if (!destinationId) {
      return noImpact;
    }

    var destination = droppables[destinationId];
    var isWithinHomeDroppable = isHomeOf(draggable, destination);
    var insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
    var pageBorderBoxCenterWithDroppableScrollChange = withDroppableScroll(destination, pageBorderBoxCenter);
    var withMerge = getCombineImpact({
      pageBorderBoxCenterWithDroppableScrollChange: pageBorderBoxCenterWithDroppableScrollChange,
      previousImpact: previousImpact,
      draggable: draggable,
      destination: destination,
      insideDestination: insideDestination,
      userDirection: userDirection
    });

    if (withMerge) {
      return withMerge;
    }

    return isWithinHomeDroppable ? inHomeList({
      pageBorderBoxCenterWithDroppableScrollChange: pageBorderBoxCenterWithDroppableScrollChange,
      draggable: draggable,
      home: destination,
      insideHome: insideDestination,
      previousImpact: previousImpact,
      viewport: viewport,
      userDirection: userDirection
    }) : inForeignList({
      pageBorderBoxCenterWithDroppableScrollChange: pageBorderBoxCenterWithDroppableScrollChange,
      draggable: draggable,
      destination: destination,
      insideDestination: insideDestination,
      previousImpact: previousImpact,
      viewport: viewport,
      userDirection: userDirection
    });
  });

  var getDragPositions = (function (_ref) {
    var oldInitial = _ref.initial,
      oldCurrent = _ref.current,
      oldClientBorderBoxCenter = _ref.oldClientBorderBoxCenter,
      newClientBorderBoxCenter = _ref.newClientBorderBoxCenter,
      viewport = _ref.viewport;
    var shift = subtract(newClientBorderBoxCenter, oldClientBorderBoxCenter);

    var initial = function () {
      var client = {
        selection: add(oldInitial.client.selection, shift),
        borderBoxCenter: newClientBorderBoxCenter,
        offset: origin
      };
      var page = {
        selection: add(client.selection, viewport.scroll.initial),
        borderBoxCenter: add(client.selection, viewport.scroll.initial)
      };
      return {
        client: client,
        page: page
      };
    }();

    var current = function () {
      var reverse = negate(shift);
      var offset = add(oldCurrent.client.offset, reverse);
      var client = {
        selection: add(initial.client.selection, offset),
        borderBoxCenter: add(initial.client.borderBoxCenter, offset),
        offset: offset
      };
      var page = {
        selection: add(client.selection, viewport.scroll.current),
        borderBoxCenter: add(client.borderBoxCenter, viewport.scroll.current)
      };
      !isEqual(oldCurrent.client.borderBoxCenter, client.borderBoxCenter) ? invariant(false, "\n        Incorrect new client center position.\n        Expected (" + oldCurrent.client.borderBoxCenter.x + ", " + oldCurrent.client.borderBoxCenter.y + ")\n        to equal (" + client.borderBoxCenter.x + ", " + client.borderBoxCenter.y + ")\n      ") : void 0;
      return {
        client: client,
        page: page
      };
    }();

    return {
      current: current,
      initial: initial
    };
  });

  var getMaxScroll = (function (_ref) {
    var scrollHeight = _ref.scrollHeight,
      scrollWidth = _ref.scrollWidth,
      height = _ref.height,
      width = _ref.width;
    var maxScroll = subtract({
      x: scrollWidth,
      y: scrollHeight
    }, {
      x: width,
      y: height
    });
    var adjustedMaxScroll = {
      x: Math.max(0, maxScroll.x),
      y: Math.max(0, maxScroll.y)
    };
    return adjustedMaxScroll;
  });

  var getDroppableDimension = (function (_ref) {
    var descriptor = _ref.descriptor,
      isEnabled = _ref.isEnabled,
      isCombineEnabled = _ref.isCombineEnabled,
      isFixedOnPage = _ref.isFixedOnPage,
      direction = _ref.direction,
      client = _ref.client,
      page = _ref.page,
      closest$$1 = _ref.closest;

    var frame = function () {
      if (!closest$$1) {
        return null;
      }

      var scrollSize = closest$$1.scrollSize,
        frameClient = closest$$1.client;
      var maxScroll = getMaxScroll({
        scrollHeight: scrollSize.scrollHeight,
        scrollWidth: scrollSize.scrollWidth,
        height: frameClient.paddingBox.height,
        width: frameClient.paddingBox.width
      });
      return {
        pageMarginBox: closest$$1.page.marginBox,
        frameClient: frameClient,
        scrollSize: scrollSize,
        shouldClipSubject: closest$$1.shouldClipSubject,
        scroll: {
          initial: closest$$1.scroll,
          current: closest$$1.scroll,
          max: maxScroll,
          diff: {
            value: origin,
            displacement: origin
          }
        }
      };
    }();

    var axis = direction === 'vertical' ? vertical : horizontal;
    var subject = getSubject({
      page: page,
      withPlaceholder: null,
      axis: axis,
      frame: frame
    });
    var dimension = {
      descriptor: descriptor,
      isCombineEnabled: isCombineEnabled,
      isFixedOnPage: isFixedOnPage,
      axis: axis,
      isEnabled: isEnabled,
      client: client,
      page: page,
      frame: frame,
      subject: subject
    };
    return dimension;
  });

  var getRequiredGrowthForPlaceholder = function getRequiredGrowthForPlaceholder(droppable, placeholderSize, draggables) {
    var axis = droppable.axis;
    var availableSpace = droppable.subject.page.contentBox[axis.size];
    var insideDroppable = getDraggablesInsideDroppable(droppable.descriptor.id, draggables);
    var spaceUsed = insideDroppable.reduce(function (sum, dimension) {
      return sum + dimension.client.marginBox[axis.size];
    }, 0);
    var requiredSpace = spaceUsed + placeholderSize[axis.line];
    var needsToGrowBy = requiredSpace - availableSpace;

    if (needsToGrowBy <= 0) {
      return null;
    }

    return patch(axis.line, needsToGrowBy);
  };

  var withMaxScroll = function withMaxScroll(frame, max) {
    return _extends({}, frame, {
      scroll: _extends({}, frame.scroll, {
        max: max
      })
    });
  };

  var addPlaceholder = function addPlaceholder(droppable, displaceBy, draggables) {
    var frame = droppable.frame;
    !!droppable.subject.withPlaceholder ? invariant(false, 'Cannot add placeholder size to a subject when it already has one') : void 0;
    var placeholderSize = patch(droppable.axis.line, displaceBy[droppable.axis.line]);
    var requiredGrowth = getRequiredGrowthForPlaceholder(droppable, placeholderSize, draggables);
    var added = {
      placeholderSize: placeholderSize,
      increasedBy: requiredGrowth,
      oldFrameMaxScroll: droppable.frame ? droppable.frame.scroll.max : null
    };

    if (!frame) {
      var _subject = getSubject({
        page: droppable.subject.page,
        withPlaceholder: added,
        axis: droppable.axis,
        frame: droppable.frame
      });

      return _extends({}, droppable, {
        subject: _subject
      });
    }

    var maxScroll = requiredGrowth ? add(frame.scroll.max, requiredGrowth) : frame.scroll.max;
    var newFrame = withMaxScroll(frame, maxScroll);
    var subject = getSubject({
      page: droppable.subject.page,
      withPlaceholder: added,
      axis: droppable.axis,
      frame: newFrame
    });
    return _extends({}, droppable, {
      subject: subject,
      frame: newFrame
    });
  };
  var removePlaceholder = function removePlaceholder(droppable) {
    var added = droppable.subject.withPlaceholder;
    !added ? invariant(false, 'Cannot remove placeholder form subject when there was none') : void 0;
    var frame = droppable.frame;

    if (!frame) {
      var _subject2 = getSubject({
        page: droppable.subject.page,
        axis: droppable.axis,
        frame: null,
        withPlaceholder: null
      });

      return _extends({}, droppable, {
        subject: _subject2
      });
    }

    var oldMaxScroll = added.oldFrameMaxScroll;
    !oldMaxScroll ? invariant(false, 'Expected droppable with frame to have old max frame scroll when removing placeholder') : void 0;
    var newFrame = withMaxScroll(frame, oldMaxScroll);
    var subject = getSubject({
      page: droppable.subject.page,
      axis: droppable.axis,
      frame: newFrame,
      withPlaceholder: null
    });
    return _extends({}, droppable, {
      subject: subject,
      frame: newFrame
    });
  };

  var getFrame = (function (droppable) {
    var frame = droppable.frame;
    !frame ? invariant(false, 'Expected Droppable to have a frame') : void 0;
    return frame;
  });

  var throwIfSpacingChange = function throwIfSpacingChange(old, fresh) {
    {
      var getMessage = function getMessage(spacingType) {
        return "Cannot change the " + spacingType + " of a Droppable during a drag";
      };

      !isEqual$1(old.margin, fresh.margin) ? invariant(false, getMessage('margin')) : void 0;
      !isEqual$1(old.border, fresh.border) ? invariant(false, getMessage('border')) : void 0;
      !isEqual$1(old.padding, fresh.padding) ? invariant(false, getMessage('padding')) : void 0;
    }
  };

  var adjustBorderBoxSize = function adjustBorderBoxSize(axis, old, fresh) {
    return {
      top: old.top,
      left: old.left,
      right: old.left + fresh.width,
      bottom: old.top + fresh.height
    };
  };

  var adjustModifiedDroppables = (function (_ref) {
    var modified = _ref.modified,
      existingDroppables = _ref.existingDroppables,
      initialWindowScroll = _ref.initialWindowScroll;

    if (!modified.length) {
      return modified;
    }

    var adjusted = modified.map(function (provided) {
      var raw = existingDroppables[provided.descriptor.id];
      !raw ? invariant(false, 'Could not locate droppable in existing droppables') : void 0;
      var existing = raw.subject.withPlaceholder ? removePlaceholder(raw) : raw;
      var oldClient = existing.client;
      var newClient = provided.client;
      var oldScrollable = getFrame(existing);
      var newScrollable = getFrame(provided);

      {
        throwIfSpacingChange(existing.client, provided.client);
        throwIfSpacingChange(oldScrollable.frameClient, newScrollable.frameClient);
        var isFrameEqual = oldScrollable.frameClient.borderBox.height === newScrollable.frameClient.borderBox.height && oldScrollable.frameClient.borderBox.width === newScrollable.frameClient.borderBox.width;
        !isFrameEqual ? invariant(false, 'The width and height of your Droppable scroll container cannot change when adding or removing Draggables during a drag') : void 0;
      }

      var client = createBox({
        borderBox: adjustBorderBoxSize(existing.axis, oldClient.borderBox, newClient.borderBox),
        margin: oldClient.margin,
        border: oldClient.border,
        padding: oldClient.padding
      });
      var closest = {
        client: oldScrollable.frameClient,
        page: withScroll(oldScrollable.frameClient, initialWindowScroll),
        shouldClipSubject: oldScrollable.shouldClipSubject,
        scrollSize: newScrollable.scrollSize,
        scroll: oldScrollable.scroll.initial
      };
      var withSizeChanged = getDroppableDimension({
        descriptor: provided.descriptor,
        isEnabled: provided.isEnabled,
        isCombineEnabled: provided.isCombineEnabled,
        isFixedOnPage: provided.isFixedOnPage,
        direction: provided.axis.direction,
        client: client,
        page: withScroll(client, initialWindowScroll),
        closest: closest
      });
      var scrolled = scrollDroppable(withSizeChanged, newScrollable.scroll.current);
      return scrolled;
    });
    return adjusted;
  });

  var adjustAdditionsForScrollChanges = (function (_ref) {
    var additions = _ref.additions,
      modifiedDroppables = _ref.modified,
      viewport = _ref.viewport;
    var windowScrollChange = viewport.scroll.diff.value;
    var modifiedMap = toDroppableMap(modifiedDroppables);
    return additions.map(function (draggable) {
      var droppableId = draggable.descriptor.droppableId;
      var modified = modifiedMap[droppableId];
      var frame = modified.frame;
      !frame ? invariant(false) : void 0;
      var droppableScrollChange = frame.scroll.diff.value;
      var totalChange = add(windowScrollChange, droppableScrollChange);
      var client = offset(draggable.client, totalChange);
      var page = withScroll(client, viewport.scroll.initial);

      var moved = _extends({}, draggable, {
        placeholder: _extends({}, draggable.placeholder, {
          client: client
        }),
        client: client,
        page: page
      });

      return moved;
    });
  });

  var getDraggableMap = (function (_ref) {
    var existing = _ref.existing,
      addedDraggables = _ref.additions,
      removedDraggables = _ref.removals,
      initialWindowScroll = _ref.initialWindowScroll;
    var droppables = toDroppableList(existing.droppables);
    var shifted = {};
    droppables.forEach(function (droppable) {
      var axis = droppable.axis;
      var original = getDraggablesInsideDroppable(droppable.descriptor.id, existing.draggables);
      var toShift = {};

      var addShift = function addShift(id, shift) {
        var previous = toShift[id];

        if (!previous) {
          toShift[id] = shift;
          return;
        }

        toShift[id] = {
          indexChange: previous.indexChange + shift.indexChange,
          offset: add(previous.offset, shift.offset)
        };
      };

      var removals = toDraggableMap(removedDraggables.map(function (id) {
        return existing.draggables[id];
      }).filter(function (draggable) {
        return draggable.descriptor.droppableId === droppable.descriptor.id;
      }));
      var withRemovals = original.filter(function (item, index) {
        var isBeingRemoved = Boolean(removals[item.descriptor.id]);

        if (!isBeingRemoved) {
          return true;
        }

        var offset$$1 = negate(patch(axis.line, item.client.marginBox[axis.size]));
        original.slice(index).forEach(function (sibling) {
          if (removals[sibling.descriptor.id]) {
            return;
          }

          addShift(sibling.descriptor.id, {
            indexChange: -1,
            offset: offset$$1
          });
        });
        return false;
      });
      var additions = addedDraggables.filter(function (draggable) {
        return draggable.descriptor.droppableId === droppable.descriptor.id;
      });
      var withAdditions = withRemovals.slice(0);
      additions.forEach(function (item) {
        withAdditions.splice(item.descriptor.index, 0, item);
      });
      var additionMap = toDraggableMap(additions);
      withAdditions.forEach(function (item, index) {
        var wasAdded = Boolean(additionMap[item.descriptor.id]);

        if (!wasAdded) {
          return;
        }

        var offset$$1 = patch(axis.line, item.client.marginBox[axis.size]);
        withAdditions.slice(index).forEach(function (sibling) {
          if (additionMap[sibling.descriptor.id]) {
            return;
          }

          addShift(sibling.descriptor.id, {
            indexChange: 1,
            offset: offset$$1
          });
        });
      });
      withAdditions.forEach(function (item) {
        if (additionMap[item.descriptor.id]) {
          return;
        }

        var shift = toShift[item.descriptor.id];

        if (!shift) {
          return;
        }

        var client = offset(item.client, shift.offset);
        var page = withScroll(client, initialWindowScroll);
        var index = item.descriptor.index + shift.indexChange;

        var moved = _extends({}, item, {
          descriptor: _extends({}, item.descriptor, {
            index: index
          }),
          placeholder: _extends({}, item.placeholder, {
            client: client
          }),
          client: client,
          page: page
        });

        shifted[moved.descriptor.id] = moved;
      });
    });

    var draggableMap = _extends({}, existing.draggables, {}, shifted, {}, toDraggableMap(addedDraggables));

    removedDraggables.forEach(function (id) {
      delete draggableMap[id];
    });
    return draggableMap;
  });

  var withNoAnimatedDisplacement = (function (impact) {
    var displaced = impact.movement.displaced;

    if (!displaced.length) {
      return impact;
    }

    var withoutAnimation = displaced.map(function (displacement) {
      if (!displacement.shouldAnimate) {
        return displacement;
      }

      return _extends({}, displacement, {
        shouldAnimate: false
      });
    });

    var result = _extends({}, impact, {
      movement: _extends({}, impact.movement, {
        displaced: withoutAnimation,
        map: getDisplacementMap(withoutAnimation)
      })
    });

    return result;
  });

  var whatIsDraggedOver = (function (impact) {
    var merge = impact.merge,
      destination = impact.destination;

    if (destination) {
      return destination.droppableId;
    }

    if (merge) {
      return merge.combine.droppableId;
    }

    return null;
  });

  var shouldUsePlaceholder = (function (descriptor, impact) {
    var isOver = whatIsDraggedOver(impact);

    if (!isOver) {
      return false;
    }

    return isOver !== descriptor.droppableId;
  });

  var patchDroppableMap = (function (dimensions, updated) {
    var _extends2;

    return _extends({}, dimensions, {
      droppables: _extends({}, dimensions.droppables, (_extends2 = {}, _extends2[updated.descriptor.id] = updated, _extends2))
    });
  });

  var clearUnusedPlaceholder = function clearUnusedPlaceholder(_ref) {
    var previousImpact = _ref.previousImpact,
      impact = _ref.impact,
      dimensions = _ref.dimensions;
    var last = whatIsDraggedOver(previousImpact);
    var now = whatIsDraggedOver(impact);

    if (!last) {
      return dimensions;
    }

    if (last === now) {
      return dimensions;
    }

    var lastDroppable = dimensions.droppables[last];

    if (!lastDroppable.subject.withPlaceholder) {
      return dimensions;
    }

    var updated = removePlaceholder(lastDroppable);
    return patchDroppableMap(dimensions, updated);
  };

  var getDimensionMapWithPlaceholder = (function (_ref2) {
    var dimensions = _ref2.dimensions,
      previousImpact = _ref2.previousImpact,
      draggable = _ref2.draggable,
      impact = _ref2.impact;
    var base = clearUnusedPlaceholder({
      previousImpact: previousImpact,
      impact: impact,
      dimensions: dimensions
    });
    var usePlaceholder = shouldUsePlaceholder(draggable.descriptor, impact);

    if (!usePlaceholder) {
      return base;
    }

    var droppableId = whatIsDraggedOver(impact);

    if (!droppableId) {
      return base;
    }

    var droppable = base.droppables[droppableId];

    if (droppable.subject.withPlaceholder) {
      return base;
    }

    var patched = addPlaceholder(droppable, draggable.displaceBy, base.draggables);
    return patchDroppableMap(base, patched);
  });

  var timingsKey = 'Processing dynamic changes';
  var publishWhileDragging = (function (_ref) {
    var _extends2, _extends3;

    var state = _ref.state,
      published = _ref.published;
    start(timingsKey);
    var adjusted = adjustModifiedDroppables({
      modified: published.modified,
      existingDroppables: state.dimensions.droppables,
      initialWindowScroll: state.viewport.scroll.initial
    });
    var shifted = adjustAdditionsForScrollChanges({
      additions: published.additions,
      modified: adjusted,
      viewport: state.viewport
    });
    var patched = {
      draggables: state.dimensions.draggables,
      droppables: _extends({}, state.dimensions.droppables, {}, toDroppableMap(adjusted))
    };
    var draggables = getDraggableMap({
      existing: patched,
      additions: shifted,
      removals: published.removals,
      initialWindowScroll: state.viewport.scroll.initial
    });
    var dragging = state.critical.draggable.id;
    var original = state.dimensions.draggables[dragging];
    var updated = draggables[dragging];
    var dimensions = getDimensionMapWithPlaceholder({
      previousImpact: state.impact,
      impact: state.impact,
      draggable: updated,
      dimensions: {
        draggables: draggables,
        droppables: patched.droppables
      }
    });
    var critical = {
      droppable: state.critical.droppable,
      draggable: updated.descriptor
    };

    var _getDragPositions = getDragPositions({
        initial: state.initial,
        current: state.current,
        oldClientBorderBoxCenter: original.client.borderBox.center,
        newClientBorderBoxCenter: updated.client.borderBox.center,
        viewport: state.viewport
      }),
      initial = _getDragPositions.initial,
      current = _getDragPositions.current;

    var impact = withNoAnimatedDisplacement(getDragImpact({
      pageBorderBoxCenter: current.page.borderBoxCenter,
      draggable: dimensions.draggables[state.critical.draggable.id],
      draggables: dimensions.draggables,
      droppables: dimensions.droppables,
      previousImpact: noImpact,
      viewport: state.viewport,
      userDirection: state.userDirection
    }));
    var isOrphaned = Boolean(state.movementMode === 'SNAP' && state.impact.destination && !impact.destination);
    !!isOrphaned ? invariant(false, 'Dragging item no longer has a valid destination after a dynamic update. This is not supported') : void 0;
    finish(timingsKey);

    var draggingState = _extends({
      phase: 'DRAGGING'
    }, state, (_extends2 = {}, _extends2["phase"] = 'DRAGGING', _extends2.critical = critical, _extends2.current = current, _extends2.initial = initial, _extends2.impact = impact, _extends2.dimensions = dimensions, _extends2.forceShouldAnimate = false, _extends2));

    if (state.phase === 'COLLECTING') {
      return draggingState;
    }

    var dropPending = _extends({
      phase: 'DROP_PENDING'
    }, draggingState, (_extends3 = {}, _extends3["phase"] = 'DROP_PENDING', _extends3.reason = state.reason, _extends3.isWaiting = false, _extends3));

    return dropPending;
  });

  var getKnownActive = function getKnownActive(droppable) {
    var rect = droppable.subject.active;
    !rect ? invariant(false, 'Cannot get clipped area from droppable') : void 0;
    return rect;
  };

  var getBestCrossAxisDroppable = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
      pageBorderBoxCenter = _ref.pageBorderBoxCenter,
      source = _ref.source,
      droppables = _ref.droppables,
      viewport = _ref.viewport;
    var active = source.subject.active;

    if (!active) {
      return null;
    }

    var axis = source.axis;
    var isBetweenSourceClipped = isWithin(active[axis.start], active[axis.end]);
    var candidates = toDroppableList(droppables).filter(function (droppable) {
      return droppable !== source;
    }).filter(function (droppable) {
      return droppable.isEnabled;
    }).filter(function (droppable) {
      return Boolean(droppable.subject.active);
    }).filter(function (droppable) {
      return isPartiallyVisibleThroughFrame(viewport.frame)(getKnownActive(droppable));
    }).filter(function (droppable) {
      var activeOfTarget = getKnownActive(droppable);

      if (isMovingForward) {
        return active[axis.crossAxisEnd] < activeOfTarget[axis.crossAxisEnd];
      }

      return activeOfTarget[axis.crossAxisStart] < active[axis.crossAxisStart];
    }).filter(function (droppable) {
      var activeOfTarget = getKnownActive(droppable);
      var isBetweenDestinationClipped = isWithin(activeOfTarget[axis.start], activeOfTarget[axis.end]);
      return isBetweenSourceClipped(activeOfTarget[axis.start]) || isBetweenSourceClipped(activeOfTarget[axis.end]) || isBetweenDestinationClipped(active[axis.start]) || isBetweenDestinationClipped(active[axis.end]);
    }).sort(function (a, b) {
      var first = getKnownActive(a)[axis.crossAxisStart];
      var second = getKnownActive(b)[axis.crossAxisStart];

      if (isMovingForward) {
        return first - second;
      }

      return second - first;
    }).filter(function (droppable, index, array) {
      return getKnownActive(droppable)[axis.crossAxisStart] === getKnownActive(array[0])[axis.crossAxisStart];
    });

    if (!candidates.length) {
      return null;
    }

    if (candidates.length === 1) {
      return candidates[0];
    }

    var contains = candidates.filter(function (droppable) {
      var isWithinDroppable = isWithin(getKnownActive(droppable)[axis.start], getKnownActive(droppable)[axis.end]);
      return isWithinDroppable(pageBorderBoxCenter[axis.line]);
    });

    if (contains.length === 1) {
      return contains[0];
    }

    if (contains.length > 1) {
      return contains.sort(function (a, b) {
        return getKnownActive(a)[axis.start] - getKnownActive(b)[axis.start];
      })[0];
    }

    return candidates.sort(function (a, b) {
      var first = closest(pageBorderBoxCenter, getCorners(getKnownActive(a)));
      var second = closest(pageBorderBoxCenter, getCorners(getKnownActive(b)));

      if (first !== second) {
        return first - second;
      }

      return getKnownActive(a)[axis.start] - getKnownActive(b)[axis.start];
    })[0];
  });

  var withDroppableDisplacement = (function (droppable, point) {
    var frame = droppable.frame;

    if (!frame) {
      return point;
    }

    return add(point, frame.scroll.diff.displacement);
  });

  var getClosestDraggable = (function (_ref) {
    var axis = _ref.axis,
      pageBorderBoxCenter = _ref.pageBorderBoxCenter,
      viewport = _ref.viewport,
      destination = _ref.destination,
      insideDestination = _ref.insideDestination;
    var sorted = insideDestination.filter(function (draggable) {
      return isTotallyVisible({
        target: draggable.page.borderBox,
        destination: destination,
        viewport: viewport.frame,
        withDroppableDisplacement: true
      });
    }).sort(function (a, b) {
      var distanceToA = distance(pageBorderBoxCenter, withDroppableDisplacement(destination, a.page.borderBox.center));
      var distanceToB = distance(pageBorderBoxCenter, withDroppableDisplacement(destination, b.page.borderBox.center));

      if (distanceToA < distanceToB) {
        return -1;
      }

      if (distanceToB < distanceToA) {
        return 1;
      }

      return a.page.borderBox[axis.start] - b.page.borderBox[axis.start];
    });
    return sorted[0] || null;
  });

  var getWillDisplaceForward = (function (_ref) {
    var isInHomeList = _ref.isInHomeList,
      proposedIndex = _ref.proposedIndex,
      startIndexInHome = _ref.startIndexInHome;
    return isInHomeList ? proposedIndex < startIndexInHome : true;
  });

  var getHomeLocation = (function (descriptor) {
    return {
      index: descriptor.index,
      droppableId: descriptor.droppableId
    };
  });

  var getHomeImpact = (function (draggable, home) {
    return {
      movement: noMovement,
      direction: home.axis.direction,
      destination: getHomeLocation(draggable.descriptor),
      merge: null
    };
  });

  var toHomeList = (function (_ref) {
    var moveIntoIndexOf = _ref.moveIntoIndexOf,
      insideDestination = _ref.insideDestination,
      draggable = _ref.draggable,
      destination = _ref.destination,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport;

    if (!moveIntoIndexOf) {
      return null;
    }

    var axis = destination.axis;
    var homeIndex = draggable.descriptor.index;
    var targetIndex = moveIntoIndexOf.descriptor.index;

    if (homeIndex === targetIndex) {
      return getHomeImpact(draggable, destination);
    }

    var willDisplaceForward = getWillDisplaceForward({
      isInHomeList: true,
      proposedIndex: targetIndex,
      startIndexInHome: homeIndex
    });
    var isMovingAfterStart = !willDisplaceForward;
    var modified = isMovingAfterStart ? insideDestination.slice(homeIndex + 1, targetIndex + 1).reverse() : insideDestination.slice(targetIndex, homeIndex);
    var displaced = modified.map(function (dimension) {
      return getDisplacement({
        draggable: dimension,
        destination: destination,
        previousImpact: previousImpact,
        viewport: viewport.frame
      });
    });
    !displaced.length ? invariant(false, 'Must displace as least one thing if not moving into the home index') : void 0;
    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy, willDisplaceForward);
    var impact = {
      movement: {
        displacedBy: displacedBy,
        displaced: displaced,
        map: getDisplacementMap(displaced),
        willDisplaceForward: willDisplaceForward
      },
      direction: axis.direction,
      destination: {
        droppableId: destination.descriptor.id,
        index: targetIndex
      },
      merge: null
    };
    return impact;
  });

  var whenCombining = (function (_ref) {
    var combine = _ref.combine,
      movement = _ref.movement,
      draggables = _ref.draggables;
    var groupingWith = combine.draggableId;
    var isDisplaced = Boolean(movement.map[groupingWith]);
    var center = draggables[groupingWith].page.borderBox.center;
    return isDisplaced ? add(center, movement.displacedBy.point) : center;
  });

  var distanceFromStartToBorderBoxCenter = function distanceFromStartToBorderBoxCenter(axis, box) {
    return box.margin[axis.start] + box.borderBox[axis.size] / 2;
  };

  var distanceFromEndToBorderBoxCenter = function distanceFromEndToBorderBoxCenter(axis, box) {
    return box.margin[axis.end] + box.borderBox[axis.size] / 2;
  };

  var getCrossAxisBorderBoxCenter = function getCrossAxisBorderBoxCenter(axis, target, isMoving) {
    return target[axis.crossAxisStart] + isMoving.margin[axis.crossAxisStart] + isMoving.borderBox[axis.crossAxisSize] / 2;
  };

  var goAfter = function goAfter(_ref) {
    var axis = _ref.axis,
      moveRelativeTo = _ref.moveRelativeTo,
      isMoving = _ref.isMoving;
    return patch(axis.line, moveRelativeTo.marginBox[axis.end] + distanceFromStartToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveRelativeTo.marginBox, isMoving));
  };
  var goBefore = function goBefore(_ref2) {
    var axis = _ref2.axis,
      moveRelativeTo = _ref2.moveRelativeTo,
      isMoving = _ref2.isMoving;
    return patch(axis.line, moveRelativeTo.marginBox[axis.start] - distanceFromEndToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveRelativeTo.marginBox, isMoving));
  };
  var goIntoStart = function goIntoStart(_ref3) {
    var axis = _ref3.axis,
      moveInto = _ref3.moveInto,
      isMoving = _ref3.isMoving;
    return patch(axis.line, moveInto.contentBox[axis.start] + distanceFromStartToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveInto.contentBox, isMoving));
  };

  var whenReordering = (function (_ref) {
    var movement = _ref.movement,
      draggable = _ref.draggable,
      draggables = _ref.draggables,
      droppable = _ref.droppable;
    var insideDestination = getDraggablesInsideDroppable(droppable.descriptor.id, draggables);
    var draggablePage = draggable.page;
    var axis = droppable.axis;

    if (!insideDestination.length) {
      return goIntoStart({
        axis: axis,
        moveInto: droppable.page,
        isMoving: draggablePage
      });
    }

    var displaced = movement.displaced,
      willDisplaceForward = movement.willDisplaceForward,
      displacedBy = movement.displacedBy;
    var isOverHome = isHomeOf(draggable, droppable);
    var closest = displaced.length ? draggables[displaced[0].draggableId] : null;

    if (!closest) {
      if (isOverHome) {
        return draggable.page.borderBox.center;
      }

      var moveRelativeTo = insideDestination[insideDestination.length - 1];
      return goAfter({
        axis: axis,
        moveRelativeTo: moveRelativeTo.page,
        isMoving: draggablePage
      });
    }

    var displacedClosest = offset(closest.page, displacedBy.point);

    if (willDisplaceForward) {
      return goBefore({
        axis: axis,
        moveRelativeTo: displacedClosest,
        isMoving: draggablePage
      });
    }

    return goAfter({
      axis: axis,
      moveRelativeTo: displacedClosest,
      isMoving: draggablePage
    });
  });

  var getResultWithoutDroppableDisplacement = function getResultWithoutDroppableDisplacement(_ref) {
    var impact = _ref.impact,
      draggable = _ref.draggable,
      droppable = _ref.droppable,
      draggables = _ref.draggables;
    var merge = impact.merge;
    var destination = impact.destination;
    var original = draggable.page.borderBox.center;

    if (!droppable) {
      return original;
    }

    if (destination) {
      return whenReordering({
        movement: impact.movement,
        draggable: draggable,
        draggables: draggables,
        droppable: droppable
      });
    }

    if (merge) {
      return whenCombining({
        movement: impact.movement,
        combine: merge.combine,
        draggables: draggables
      });
    }

    return original;
  };

  var getPageBorderBoxCenter = (function (args) {
    var withoutDisplacement = getResultWithoutDroppableDisplacement(args);
    var droppable = args.droppable;
    var withDisplacement = droppable ? withDroppableDisplacement(droppable, withoutDisplacement) : withoutDisplacement;
    return withDisplacement;
  });

  var isTotallyVisibleInNewLocation = (function (_ref) {
    var draggable = _ref.draggable,
      destination = _ref.destination,
      newPageBorderBoxCenter = _ref.newPageBorderBoxCenter,
      viewport = _ref.viewport,
      withDroppableDisplacement = _ref.withDroppableDisplacement,
      _ref$onlyOnMainAxis = _ref.onlyOnMainAxis,
      onlyOnMainAxis = _ref$onlyOnMainAxis === void 0 ? false : _ref$onlyOnMainAxis;
    var diff = subtract(newPageBorderBoxCenter, draggable.page.borderBox.center);
    var shifted = offsetByPosition(draggable.page.borderBox, diff);
    var args = {
      target: shifted,
      destination: destination,
      withDroppableDisplacement: withDroppableDisplacement,
      viewport: viewport
    };

    if (onlyOnMainAxis) {
      return isTotallyVisibleOnAxis(args);
    }

    return isTotallyVisible(args);
  });

  var toForeignList = (function (_ref) {
    var previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
      moveRelativeTo = _ref.moveRelativeTo,
      insideDestination = _ref.insideDestination,
      draggable = _ref.draggable,
      draggables = _ref.draggables,
      destination = _ref.destination,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport;
    var axis = destination.axis;

    if (!moveRelativeTo || !insideDestination.length) {
      var proposed = {
        movement: noMovement,
        direction: axis.direction,
        destination: {
          droppableId: destination.descriptor.id,
          index: 0
        },
        merge: null
      };
      var pageBorderBoxCenter = getPageBorderBoxCenter({
        impact: proposed,
        draggable: draggable,
        droppable: destination,
        draggables: draggables
      });
      var withPlaceholder = addPlaceholder(destination, draggable.displaceBy, draggables);
      var isVisibleInNewLocation = isTotallyVisibleInNewLocation({
        draggable: draggable,
        destination: withPlaceholder,
        newPageBorderBoxCenter: pageBorderBoxCenter,
        viewport: viewport.frame,
        withDroppableDisplacement: false,
        onlyOnMainAxis: true
      });
      return isVisibleInNewLocation ? proposed : null;
    }

    var targetIndex = insideDestination.indexOf(moveRelativeTo);
    !(targetIndex !== -1) ? invariant(false, 'Cannot find draggable in foreign list') : void 0;
    var isGoingBeforeTarget = Boolean(previousPageBorderBoxCenter[destination.axis.line] < moveRelativeTo.page.borderBox.center[destination.axis.line]);
    var proposedIndex = isGoingBeforeTarget ? targetIndex : targetIndex + 1;
    var displaced = insideDestination.slice(proposedIndex).map(function (dimension) {
      return getDisplacement({
        draggable: dimension,
        destination: destination,
        viewport: viewport.frame,
        previousImpact: previousImpact
      });
    });
    var willDisplaceForward = true;
    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy, willDisplaceForward);
    var impact = {
      movement: {
        displacedBy: displacedBy,
        displaced: displaced,
        map: getDisplacementMap(displaced),
        willDisplaceForward: willDisplaceForward
      },
      direction: axis.direction,
      destination: {
        droppableId: destination.descriptor.id,
        index: proposedIndex
      },
      merge: null
    };
    return impact;
  });

  var moveToNewDroppable = (function (_ref) {
    var previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
      destination = _ref.destination,
      insideDestination = _ref.insideDestination,
      draggable = _ref.draggable,
      draggables = _ref.draggables,
      moveRelativeTo = _ref.moveRelativeTo,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport;

    if (insideDestination.length && !moveRelativeTo) {
      return null;
    }

    if (moveRelativeTo) {
      !(moveRelativeTo.descriptor.droppableId === destination.descriptor.id) ? invariant(false, 'Unable to find target in destination droppable') : void 0;
    }

    var isMovingToHome = isHomeOf(draggable, destination);
    return isMovingToHome ? toHomeList({
      moveIntoIndexOf: moveRelativeTo,
      insideDestination: insideDestination,
      draggable: draggable,
      destination: destination,
      previousImpact: previousImpact,
      viewport: viewport
    }) : toForeignList({
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      moveRelativeTo: moveRelativeTo,
      insideDestination: insideDestination,
      draggable: draggable,
      draggables: draggables,
      destination: destination,
      previousImpact: previousImpact,
      viewport: viewport
    });
  });

  var withViewportDisplacement = (function (viewport, point) {
    return add(viewport.scroll.diff.displacement, point);
  });

  var getClientFromPageBorderBoxCenter = (function (_ref) {
    var pageBorderBoxCenter = _ref.pageBorderBoxCenter,
      draggable = _ref.draggable,
      viewport = _ref.viewport;
    var withoutPageScrollChange = withViewportDisplacement(viewport, pageBorderBoxCenter);
    var offset = subtract(withoutPageScrollChange, draggable.page.borderBox.center);
    return add(draggable.client.borderBox.center, offset);
  });

  var moveCrossAxis = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
      previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
      draggable = _ref.draggable,
      isOver = _ref.isOver,
      draggables = _ref.draggables,
      droppables = _ref.droppables,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport;
    var destination = getBestCrossAxisDroppable({
      isMovingForward: isMovingForward,
      pageBorderBoxCenter: previousPageBorderBoxCenter,
      source: isOver,
      droppables: droppables,
      viewport: viewport
    });

    if (!destination) {
      return null;
    }

    var insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
    var moveRelativeTo = getClosestDraggable({
      axis: destination.axis,
      pageBorderBoxCenter: previousPageBorderBoxCenter,
      viewport: viewport,
      destination: destination,
      insideDestination: insideDestination
    });
    var impact = moveToNewDroppable({
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      destination: destination,
      draggable: draggable,
      draggables: draggables,
      moveRelativeTo: moveRelativeTo,
      insideDestination: insideDestination,
      previousImpact: previousImpact,
      viewport: viewport
    });

    if (!impact) {
      return null;
    }

    var pageBorderBoxCenter = getPageBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      droppable: destination,
      draggables: draggables
    });
    var clientSelection = getClientFromPageBorderBoxCenter({
      pageBorderBoxCenter: pageBorderBoxCenter,
      draggable: draggable,
      viewport: viewport
    });
    return {
      clientSelection: clientSelection,
      impact: impact,
      scrollJumpRequest: null
    };
  });

  var forward = {
    vertical: 'down',
    horizontal: 'right'
  };
  var backward = {
    vertical: 'up',
    horizontal: 'left'
  };

  var moveToNextCombine = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
      isInHomeList = _ref.isInHomeList,
      draggable = _ref.draggable,
      destination = _ref.destination,
      originalInsideDestination = _ref.insideDestination,
      previousImpact = _ref.previousImpact;

    if (!destination.isCombineEnabled) {
      return null;
    }

    if (previousImpact.merge) {
      return null;
    }

    var location = previousImpact.destination;
    !location ? invariant(false, 'Need a previous location to move from into a combine') : void 0;
    var currentIndex = location.index;

    var currentInsideDestination = function () {
      var shallow = originalInsideDestination.slice();

      if (isInHomeList) {
        shallow.splice(draggable.descriptor.index, 1);
      }

      shallow.splice(location.index, 0, draggable);
      return shallow;
    }();

    var targetIndex = isMovingForward ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex < 0) {
      return null;
    }

    if (targetIndex > currentInsideDestination.length - 1) {
      return null;
    }

    var target = currentInsideDestination[targetIndex];
    var merge = {
      whenEntered: isMovingForward ? forward : backward,
      combine: {
        draggableId: target.descriptor.id,
        droppableId: destination.descriptor.id
      }
    };
    var impact = {
      movement: previousImpact.movement,
      destination: null,
      direction: destination.axis.direction,
      merge: merge
    };
    return impact;
  });

  var addClosest = function addClosest(add, displaced) {
    var added = {
      draggableId: add.descriptor.id,
      isVisible: true,
      shouldAnimate: true
    };
    return [added].concat(displaced);
  };
  var removeClosest = function removeClosest(displaced) {
    return displaced.slice(1);
  };

  var fromReorder = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
      isInHomeList = _ref.isInHomeList,
      previousImpact = _ref.previousImpact,
      draggable = _ref.draggable,
      initialInside = _ref.insideDestination;

    if (previousImpact.merge) {
      return null;
    }

    var location = previousImpact.destination;
    !location ? invariant(false, 'Cannot move to next index without previous destination') : void 0;
    var insideDestination = initialInside.slice();
    var currentIndex = location.index;
    var isInForeignList = !isInHomeList;

    if (isInForeignList) {
      insideDestination.splice(location.index, 0, draggable);
    }

    var proposedIndex = isMovingForward ? currentIndex + 1 : currentIndex - 1;

    if (proposedIndex < 0) {
      return null;
    }

    if (proposedIndex > insideDestination.length - 1) {
      return null;
    }

    return {
      proposedIndex: proposedIndex,
      modifyDisplacement: true
    };
  });

  var fromCombine = (function (_ref) {
    var isInHomeList = _ref.isInHomeList,
      isMovingForward = _ref.isMovingForward,
      draggable = _ref.draggable,
      destination = _ref.destination,
      previousImpact = _ref.previousImpact,
      draggables = _ref.draggables,
      merge = _ref.merge;

    if (!destination.isCombineEnabled) {
      return null;
    }

    var movement = previousImpact.movement;
    var combineId = merge.combine.draggableId;
    var combine = draggables[combineId];
    var combineIndex = combine.descriptor.index;
    var isCombineDisplaced = Boolean(movement.map[combineId]);

    if (!isCombineDisplaced) {
      var willDisplaceForward = getWillDisplaceForward({
        isInHomeList: isInHomeList,
        proposedIndex: combineIndex,
        startIndexInHome: draggable.descriptor.index
      });

      if (willDisplaceForward) {
        if (isMovingForward) {
          return {
            proposedIndex: combineIndex + 1,
            modifyDisplacement: false
          };
        }

        return {
          proposedIndex: combineIndex,
          modifyDisplacement: true
        };
      }

      if (isMovingForward) {
        return {
          proposedIndex: combineIndex,
          modifyDisplacement: true
        };
      }

      return {
        proposedIndex: combineIndex - 1,
        modifyDisplacement: false
      };
    }

    var isDisplacedForward = movement.willDisplaceForward;
    var visualIndex = isDisplacedForward ? combineIndex + 1 : combineIndex - 1;

    if (isDisplacedForward) {
      if (isMovingForward) {
        return {
          proposedIndex: visualIndex,
          modifyDisplacement: true
        };
      }

      return {
        proposedIndex: visualIndex - 1,
        modifyDisplacement: false
      };
    }

    if (isMovingForward) {
      return {
        proposedIndex: visualIndex + 1,
        modifyDisplacement: false
      };
    }

    return {
      proposedIndex: visualIndex,
      modifyDisplacement: true
    };
  });

  var getIsIncreasingDisplacement = function getIsIncreasingDisplacement(_ref) {
    var isInHomeList = _ref.isInHomeList,
      isMovingForward = _ref.isMovingForward,
      proposedIndex = _ref.proposedIndex,
      startIndexInHome = _ref.startIndexInHome;

    if (!isInHomeList) {
      return !isMovingForward;
    }

    if (isMovingForward) {
      return proposedIndex > startIndexInHome;
    }

    return proposedIndex < startIndexInHome;
  };

  var moveToNextIndex = (function (_ref2) {
    var isMovingForward = _ref2.isMovingForward,
      isInHomeList = _ref2.isInHomeList,
      draggable = _ref2.draggable,
      draggables = _ref2.draggables,
      destination = _ref2.destination,
      insideDestination = _ref2.insideDestination,
      previousImpact = _ref2.previousImpact;

    var instruction = function () {
      if (previousImpact.destination) {
        return fromReorder({
          isMovingForward: isMovingForward,
          isInHomeList: isInHomeList,
          draggable: draggable,
          previousImpact: previousImpact,
          insideDestination: insideDestination
        });
      }

      !previousImpact.merge ? invariant(false, 'Cannot move to next spot without a destination or merge') : void 0;
      return fromCombine({
        isInHomeList: isInHomeList,
        isMovingForward: isMovingForward,
        draggable: draggable,
        destination: destination,
        previousImpact: previousImpact,
        draggables: draggables,
        merge: previousImpact.merge
      });
    }();

    if (instruction == null) {
      return null;
    }

    var proposedIndex = instruction.proposedIndex,
      modifyDisplacement = instruction.modifyDisplacement;
    var startIndexInHome = draggable.descriptor.index;
    var willDisplaceForward = getWillDisplaceForward({
      isInHomeList: isInHomeList,
      proposedIndex: proposedIndex,
      startIndexInHome: startIndexInHome
    });
    var displacedBy = getDisplacedBy(destination.axis, draggable.displaceBy, willDisplaceForward);
    var atProposedIndex = insideDestination[proposedIndex];

    var displaced = function () {
      if (!modifyDisplacement) {
        return previousImpact.movement.displaced;
      }

      var isIncreasingDisplacement = getIsIncreasingDisplacement({
        isInHomeList: isInHomeList,
        isMovingForward: isMovingForward,
        proposedIndex: proposedIndex,
        startIndexInHome: startIndexInHome
      });
      var lastDisplaced = previousImpact.movement.displaced;
      return isIncreasingDisplacement ? addClosest(atProposedIndex, lastDisplaced) : removeClosest(lastDisplaced);
    }();

    return {
      movement: {
        displacedBy: displacedBy,
        willDisplaceForward: willDisplaceForward,
        displaced: displaced,
        map: getDisplacementMap(displaced)
      },
      direction: destination.axis.direction,
      destination: {
        droppableId: destination.descriptor.id,
        index: proposedIndex
      },
      merge: null
    };
  });

  var scrollViewport = (function (viewport, newScroll) {
    var diff = subtract(newScroll, viewport.scroll.initial);
    var displacement = negate(diff);
    var frame = getRect({
      top: newScroll.y,
      bottom: newScroll.y + viewport.frame.height,
      left: newScroll.x,
      right: newScroll.x + viewport.frame.width
    });
    var updated = {
      frame: frame,
      scroll: {
        initial: viewport.scroll.initial,
        max: viewport.scroll.max,
        current: newScroll,
        diff: {
          value: diff,
          displacement: displacement
        }
      }
    };
    return updated;
  });

  var withNewDisplacement = (function (impact, displaced) {
    return _extends({}, impact, {
      movement: _extends({}, impact.movement, {
        displaced: displaced,
        map: getDisplacementMap(displaced)
      })
    });
  });

  var speculativelyIncrease = (function (_ref) {
    var impact = _ref.impact,
      viewport = _ref.viewport,
      destination = _ref.destination,
      draggables = _ref.draggables,
      maxScrollChange = _ref.maxScrollChange;
    var displaced = impact.movement.displaced;
    var scrolledViewport = scrollViewport(viewport, add(viewport.scroll.current, maxScrollChange));
    var scrolledDroppable = destination.frame ? scrollDroppable(destination, add(destination.frame.scroll.current, maxScrollChange)) : destination;
    var updated = displaced.map(function (entry) {
      if (entry.isVisible) {
        return entry;
      }

      var result = getDisplacement({
        draggable: draggables[entry.draggableId],
        destination: scrolledDroppable,
        previousImpact: impact,
        viewport: scrolledViewport.frame
      });

      if (!result.isVisible) {
        return entry;
      }

      return {
        draggableId: entry.draggableId,
        isVisible: true,
        shouldAnimate: false
      };
    });
    return withNewDisplacement(impact, updated);
  });

  var moveToNextPlace = (function (_ref) {
    var isMovingForward = _ref.isMovingForward,
      draggable = _ref.draggable,
      destination = _ref.destination,
      draggables = _ref.draggables,
      previousImpact = _ref.previousImpact,
      viewport = _ref.viewport,
      previousPageBorderBoxCenter = _ref.previousPageBorderBoxCenter,
      previousClientSelection = _ref.previousClientSelection;

    if (!destination.isEnabled) {
      return null;
    }

    var insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
    var isInHomeList = isHomeOf(draggable, destination);
    var impact = moveToNextCombine({
      isInHomeList: isInHomeList,
      isMovingForward: isMovingForward,
      draggable: draggable,
      destination: destination,
      insideDestination: insideDestination,
      previousImpact: previousImpact
    }) || moveToNextIndex({
      isMovingForward: isMovingForward,
      isInHomeList: isInHomeList,
      draggable: draggable,
      draggables: draggables,
      destination: destination,
      insideDestination: insideDestination,
      previousImpact: previousImpact
    });

    if (!impact) {
      return null;
    }

    var pageBorderBoxCenter = getPageBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      droppable: destination,
      draggables: draggables
    });
    var isVisibleInNewLocation = isTotallyVisibleInNewLocation({
      draggable: draggable,
      destination: destination,
      newPageBorderBoxCenter: pageBorderBoxCenter,
      viewport: viewport.frame,
      withDroppableDisplacement: false,
      onlyOnMainAxis: true
    });

    if (isVisibleInNewLocation) {
      var clientSelection = getClientFromPageBorderBoxCenter({
        pageBorderBoxCenter: pageBorderBoxCenter,
        draggable: draggable,
        viewport: viewport
      });
      return {
        clientSelection: clientSelection,
        impact: impact,
        scrollJumpRequest: null
      };
    }

    var distance$$1 = subtract(pageBorderBoxCenter, previousPageBorderBoxCenter);
    var cautious = speculativelyIncrease({
      impact: impact,
      viewport: viewport,
      destination: destination,
      draggables: draggables,
      maxScrollChange: distance$$1
    });
    return {
      clientSelection: previousClientSelection,
      impact: cautious,
      scrollJumpRequest: distance$$1
    };
  });

  var getDroppableOver$1 = function getDroppableOver(impact, droppables) {
    var id = whatIsDraggedOver(impact);
    return id ? droppables[id] : null;
  };

  var moveInDirection = (function (_ref) {
    var state = _ref.state,
      type = _ref.type;
    var isActuallyOver = getDroppableOver$1(state.impact, state.dimensions.droppables);
    var isMainAxisMovementAllowed = Boolean(isActuallyOver);
    var home = state.dimensions.droppables[state.critical.droppable.id];
    var isOver = isActuallyOver || home;
    var direction = isOver.axis.direction;
    var isMovingOnMainAxis = direction === 'vertical' && (type === 'MOVE_UP' || type === 'MOVE_DOWN') || direction === 'horizontal' && (type === 'MOVE_LEFT' || type === 'MOVE_RIGHT');

    if (isMovingOnMainAxis && !isMainAxisMovementAllowed) {
      return null;
    }

    var isMovingForward = type === 'MOVE_DOWN' || type === 'MOVE_RIGHT';
    var draggable = state.dimensions.draggables[state.critical.draggable.id];
    var previousPageBorderBoxCenter = state.current.page.borderBoxCenter;
    var _state$dimensions = state.dimensions,
      draggables = _state$dimensions.draggables,
      droppables = _state$dimensions.droppables;
    var viewport = state.viewport;
    return isMovingOnMainAxis ? moveToNextPlace({
      isMovingForward: isMovingForward,
      draggable: draggable,
      destination: isOver,
      draggables: draggables,
      viewport: viewport,
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      previousClientSelection: state.current.client.selection,
      previousImpact: state.impact
    }) : moveCrossAxis({
      isMovingForward: isMovingForward,
      previousPageBorderBoxCenter: previousPageBorderBoxCenter,
      draggable: draggable,
      isOver: isOver,
      draggables: draggables,
      droppables: droppables,
      previousImpact: state.impact,
      viewport: viewport
    });
  });

  function isMovementAllowed(state) {
    return state.phase === 'DRAGGING' || state.phase === 'COLLECTING';
  }

  var getVertical = function getVertical(previous, diff) {
    if (diff === 0) {
      return previous;
    }

    return diff > 0 ? 'down' : 'up';
  };

  var getHorizontal = function getHorizontal(previous, diff) {
    if (diff === 0) {
      return previous;
    }

    return diff > 0 ? 'right' : 'left';
  };

  var getUserDirection = (function (previous, oldPageBorderBoxCenter, newPageBorderBoxCenter) {
    var diff = subtract(newPageBorderBoxCenter, oldPageBorderBoxCenter);
    return {
      horizontal: getHorizontal(previous.horizontal, diff.x),
      vertical: getVertical(previous.vertical, diff.y)
    };
  });

  var update = (function (_ref) {
    var state = _ref.state,
      forcedClientSelection = _ref.clientSelection,
      forcedDimensions = _ref.dimensions,
      forcedViewport = _ref.viewport,
      forcedImpact = _ref.impact,
      scrollJumpRequest = _ref.scrollJumpRequest;
    var viewport = forcedViewport || state.viewport;
    var currentWindowScroll = viewport.scroll.current;
    var dimensions = forcedDimensions || state.dimensions;
    var clientSelection = forcedClientSelection || state.current.client.selection;
    var offset = subtract(clientSelection, state.initial.client.selection);
    var client = {
      offset: offset,
      selection: clientSelection,
      borderBoxCenter: add(state.initial.client.borderBoxCenter, offset)
    };
    var page = {
      selection: add(client.selection, currentWindowScroll),
      borderBoxCenter: add(client.borderBoxCenter, currentWindowScroll)
    };
    var current = {
      client: client,
      page: page
    };
    var userDirection = getUserDirection(state.userDirection, state.current.page.borderBoxCenter, current.page.borderBoxCenter);

    if (state.phase === 'COLLECTING') {
      return _extends({
        phase: 'COLLECTING'
      }, state, {
        dimensions: dimensions,
        viewport: viewport,
        current: current,
        userDirection: userDirection
      });
    }

    var draggable = dimensions.draggables[state.critical.draggable.id];
    var newImpact = forcedImpact || getDragImpact({
      pageBorderBoxCenter: page.borderBoxCenter,
      draggable: draggable,
      draggables: dimensions.draggables,
      droppables: dimensions.droppables,
      previousImpact: state.impact,
      viewport: viewport,
      userDirection: userDirection
    });
    var withUpdatedPlaceholders = getDimensionMapWithPlaceholder({
      draggable: draggable,
      impact: newImpact,
      previousImpact: state.impact,
      dimensions: dimensions
    });

    var result = _extends({}, state, {
      current: current,
      userDirection: userDirection,
      dimensions: withUpdatedPlaceholders,
      impact: newImpact,
      viewport: viewport,
      scrollJumpRequest: scrollJumpRequest || null,
      forceShouldAnimate: scrollJumpRequest ? false : null
    });

    return result;
  });

  var recomputeDisplacementVisibility = (function (_ref) {
    var impact = _ref.impact,
      viewport = _ref.viewport,
      destination = _ref.destination,
      draggables = _ref.draggables;
    var updated = impact.movement.displaced.map(function (entry) {
      return getDisplacement({
        draggable: draggables[entry.draggableId],
        destination: destination,
        previousImpact: impact,
        viewport: viewport.frame
      });
    });
    return withNewDisplacement(impact, updated);
  });

  var getClientBorderBoxCenter = (function (_ref) {
    var impact = _ref.impact,
      draggable = _ref.draggable,
      droppable = _ref.droppable,
      draggables = _ref.draggables,
      viewport = _ref.viewport;
    var pageBorderBoxCenter = getPageBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      draggables: draggables,
      droppable: droppable
    });
    return getClientFromPageBorderBoxCenter({
      pageBorderBoxCenter: pageBorderBoxCenter,
      draggable: draggable,
      viewport: viewport
    });
  });

  var refreshSnap = (function (_ref) {
    var state = _ref.state,
      forcedDimensions = _ref.dimensions,
      forcedViewport = _ref.viewport;
    !(state.movementMode === 'SNAP') ? invariant(false) : void 0;
    var needsVisibilityCheck = state.impact;
    var viewport = forcedViewport || state.viewport;
    var dimensions = forcedDimensions || state.dimensions;
    var draggables = dimensions.draggables,
      droppables = dimensions.droppables;
    var draggable = draggables[state.critical.draggable.id];
    var isOver = whatIsDraggedOver(needsVisibilityCheck);
    !isOver ? invariant(false, 'Must be over a destination in SNAP movement mode') : void 0;
    var destination = droppables[isOver];
    var impact = recomputeDisplacementVisibility({
      impact: needsVisibilityCheck,
      viewport: viewport,
      destination: destination,
      draggables: draggables
    });
    var clientSelection = getClientBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      droppable: destination,
      draggables: draggables,
      viewport: viewport
    });
    return update({
      impact: impact,
      clientSelection: clientSelection,
      state: state,
      dimensions: dimensions,
      viewport: viewport
    });
  });

  var isSnapping = function isSnapping(state) {
    return state.movementMode === 'SNAP';
  };

  var postDroppableChange = function postDroppableChange(state, updated, isEnabledChanging) {
    var dimensions = patchDroppableMap(state.dimensions, updated);

    if (!isSnapping(state) || isEnabledChanging) {
      return update({
        state: state,
        dimensions: dimensions
      });
    }

    return refreshSnap({
      state: state,
      dimensions: dimensions
    });
  };

  var idle = {
    phase: 'IDLE'
  };
  var reducer = (function (state, action) {
    if (state === void 0) {
      state = idle;
    }

    if (action.type === 'CLEAN') {
      return idle;
    }

    if (action.type === 'INITIAL_PUBLISH') {
      !(state.phase === 'IDLE') ? invariant(false, 'INITIAL_PUBLISH must come after a IDLE phase') : void 0;
      var _action$payload = action.payload,
        critical = _action$payload.critical,
        clientSelection = _action$payload.clientSelection,
        viewport = _action$payload.viewport,
        dimensions = _action$payload.dimensions,
        movementMode = _action$payload.movementMode;
      var draggable = dimensions.draggables[critical.draggable.id];
      var home = dimensions.droppables[critical.droppable.id];
      var client = {
        selection: clientSelection,
        borderBoxCenter: draggable.client.borderBox.center,
        offset: origin
      };
      var initial = {
        client: client,
        page: {
          selection: add(client.selection, viewport.scroll.initial),
          borderBoxCenter: add(client.selection, viewport.scroll.initial)
        }
      };
      var isWindowScrollAllowed = toDroppableList(dimensions.droppables).every(function (item) {
        return !item.isFixedOnPage;
      });
      var result = {
        phase: 'DRAGGING',
        isDragging: true,
        critical: critical,
        movementMode: movementMode,
        dimensions: dimensions,
        initial: initial,
        current: initial,
        isWindowScrollAllowed: isWindowScrollAllowed,
        impact: getHomeImpact(draggable, home),
        viewport: viewport,
        userDirection: forward,
        scrollJumpRequest: null,
        forceShouldAnimate: null
      };
      return result;
    }

    if (action.type === 'COLLECTION_STARTING') {
      var _extends2;

      if (state.phase === 'COLLECTING' || state.phase === 'DROP_PENDING') {
        return state;
      }

      !(state.phase === 'DRAGGING') ? invariant(false, "Collection cannot start from phase " + state.phase) : void 0;

      var _result = _extends({
        phase: 'COLLECTING'
      }, state, (_extends2 = {}, _extends2["phase"] = 'COLLECTING', _extends2));

      return _result;
    }

    if (action.type === 'PUBLISH_WHILE_DRAGGING') {
      !(state.phase === 'COLLECTING' || state.phase === 'DROP_PENDING') ? invariant(false, "Unexpected " + action.type + " received in phase " + state.phase) : void 0;
      return publishWhileDragging({
        state: state,
        published: action.payload
      });
    }

    if (action.type === 'MOVE') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      !isMovementAllowed(state) ? invariant(false, action.type + " not permitted in phase " + state.phase) : void 0;
      var _clientSelection = action.payload.client;

      if (isEqual(_clientSelection, state.current.client.selection)) {
        return state;
      }

      return update({
        state: state,
        clientSelection: _clientSelection,
        impact: isSnapping(state) ? state.impact : null
      });
    }

    if (action.type === 'UPDATE_DROPPABLE_SCROLL') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      if (state.phase === 'COLLECTING') {
        return state;
      }

      !isMovementAllowed(state) ? invariant(false, action.type + " not permitted in phase " + state.phase) : void 0;
      var _action$payload2 = action.payload,
        id = _action$payload2.id,
        offset = _action$payload2.offset;
      var target = state.dimensions.droppables[id];

      if (!target) {
        return state;
      }

      var scrolled = scrollDroppable(target, offset);
      return postDroppableChange(state, scrolled, false);
    }

    if (action.type === 'UPDATE_DROPPABLE_IS_ENABLED') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      !isMovementAllowed(state) ? invariant(false, "Attempting to move in an unsupported phase " + state.phase) : void 0;
      var _action$payload3 = action.payload,
        _id = _action$payload3.id,
        isEnabled = _action$payload3.isEnabled;
      var _target = state.dimensions.droppables[_id];
      !_target ? invariant(false, "Cannot find Droppable[id: " + _id + "] to toggle its enabled state") : void 0;
      !(_target.isEnabled !== isEnabled) ? invariant(false, "Trying to set droppable isEnabled to " + String(isEnabled) + "\n      but it is already " + String(_target.isEnabled)) : void 0;

      var updated = _extends({}, _target, {
        isEnabled: isEnabled
      });

      return postDroppableChange(state, updated, true);
    }

    if (action.type === 'UPDATE_DROPPABLE_IS_COMBINE_ENABLED') {
      if (state.phase === 'DROP_PENDING') {
        return state;
      }

      !isMovementAllowed(state) ? invariant(false, "Attempting to move in an unsupported phase " + state.phase) : void 0;
      var _action$payload4 = action.payload,
        _id2 = _action$payload4.id,
        isCombineEnabled = _action$payload4.isCombineEnabled;
      var _target2 = state.dimensions.droppables[_id2];
      !_target2 ? invariant(false, "Cannot find Droppable[id: " + _id2 + "] to toggle its isCombineEnabled state") : void 0;
      !(_target2.isCombineEnabled !== isCombineEnabled) ? invariant(false, "Trying to set droppable isCombineEnabled to " + String(isCombineEnabled) + "\n      but it is already " + String(_target2.isCombineEnabled)) : void 0;

      var _updated = _extends({}, _target2, {
        isCombineEnabled: isCombineEnabled
      });

      return postDroppableChange(state, _updated, true);
    }

    if (action.type === 'MOVE_BY_WINDOW_SCROLL') {
      if (state.phase === 'DROP_PENDING' || state.phase === 'DROP_ANIMATING') {
        return state;
      }

      !isMovementAllowed(state) ? invariant(false, "Cannot move by window in phase " + state.phase) : void 0;
      !state.isWindowScrollAllowed ? invariant(false, 'Window scrolling is currently not supported for fixed lists. Aborting drag') : void 0;
      var newScroll = action.payload.newScroll;

      if (isEqual(state.viewport.scroll.current, newScroll)) {
        return state;
      }

      var _viewport = scrollViewport(state.viewport, newScroll);

      if (isSnapping(state)) {
        return refreshSnap({
          state: state,
          viewport: _viewport
        });
      }

      return update({
        state: state,
        viewport: _viewport
      });
    }

    if (action.type === 'UPDATE_VIEWPORT_MAX_SCROLL') {
      !isMovementAllowed(state) ? invariant(false, "Cannot update viewport scroll in phase " + state.phase) : void 0;
      var maxScroll = action.payload.maxScroll;

      var withMaxScroll = _extends({}, state.viewport, {
        scroll: _extends({}, state.viewport.scroll, {
          max: maxScroll
        })
      });

      return _extends({
        phase: 'DRAGGING'
      }, state, {
        viewport: withMaxScroll
      });
    }

    if (action.type === 'MOVE_UP' || action.type === 'MOVE_DOWN' || action.type === 'MOVE_LEFT' || action.type === 'MOVE_RIGHT') {
      if (state.phase === 'COLLECTING' || state.phase === 'DROP_PENDING') {
        return state;
      }

      !(state.phase === 'DRAGGING') ? invariant(false, action.type + " received while not in DRAGGING phase") : void 0;

      var _result2 = moveInDirection({
        state: state,
        type: action.type
      });

      if (!_result2) {
        return state;
      }

      return update({
        state: state,
        impact: _result2.impact,
        clientSelection: _result2.clientSelection,
        scrollJumpRequest: _result2.scrollJumpRequest
      });
    }

    if (action.type === 'DROP_PENDING') {
      var _extends3;

      var reason = action.payload.reason;
      !(state.phase === 'COLLECTING') ? invariant(false, 'Can only move into the DROP_PENDING phase from the COLLECTING phase') : void 0;

      var newState = _extends({
        phase: 'DROP_PENDING'
      }, state, (_extends3 = {}, _extends3["phase"] = 'DROP_PENDING', _extends3.isWaiting = true, _extends3.reason = reason, _extends3));

      return newState;
    }

    if (action.type === 'DROP_ANIMATE') {
      var pending = action.payload;
      !(state.phase === 'DRAGGING' || state.phase === 'DROP_PENDING') ? invariant(false, "Cannot animate drop from phase " + state.phase) : void 0;
      var _result3 = {
        phase: 'DROP_ANIMATING',
        pending: pending,
        dimensions: state.dimensions
      };
      return _result3;
    }

    if (action.type === 'DROP_COMPLETE') {
      return idle;
    }

    return state;
  });

  var lift = function lift(args) {
    return {
      type: 'LIFT',
      payload: args
    };
  };
  var initialPublish = function initialPublish(args) {
    return {
      type: 'INITIAL_PUBLISH',
      payload: args
    };
  };
  var publishWhileDragging$1 = function publishWhileDragging(args) {
    return {
      type: 'PUBLISH_WHILE_DRAGGING',
      payload: args
    };
  };
  var collectionStarting = function collectionStarting() {
    return {
      type: 'COLLECTION_STARTING',
      payload: null
    };
  };
  var updateDroppableScroll = function updateDroppableScroll(args) {
    return {
      type: 'UPDATE_DROPPABLE_SCROLL',
      payload: args
    };
  };
  var updateDroppableIsEnabled = function updateDroppableIsEnabled(args) {
    return {
      type: 'UPDATE_DROPPABLE_IS_ENABLED',
      payload: args
    };
  };
  var updateDroppableIsCombineEnabled = function updateDroppableIsCombineEnabled(args) {
    return {
      type: 'UPDATE_DROPPABLE_IS_COMBINE_ENABLED',
      payload: args
    };
  };
  var move = function move(args) {
    return {
      type: 'MOVE',
      payload: args
    };
  };
  var moveByWindowScroll = function moveByWindowScroll(args) {
    return {
      type: 'MOVE_BY_WINDOW_SCROLL',
      payload: args
    };
  };
  var updateViewportMaxScroll = function updateViewportMaxScroll(args) {
    return {
      type: 'UPDATE_VIEWPORT_MAX_SCROLL',
      payload: args
    };
  };
  var moveUp = function moveUp() {
    return {
      type: 'MOVE_UP',
      payload: null
    };
  };
  var moveDown = function moveDown() {
    return {
      type: 'MOVE_DOWN',
      payload: null
    };
  };
  var moveRight = function moveRight() {
    return {
      type: 'MOVE_RIGHT',
      payload: null
    };
  };
  var moveLeft = function moveLeft() {
    return {
      type: 'MOVE_LEFT',
      payload: null
    };
  };
  var clean = function clean() {
    return {
      type: 'CLEAN',
      payload: null
    };
  };
  var animateDrop = function animateDrop(pending) {
    return {
      type: 'DROP_ANIMATE',
      payload: pending
    };
  };
  var completeDrop = function completeDrop(result) {
    return {
      type: 'DROP_COMPLETE',
      payload: result
    };
  };
  var drop = function drop(args) {
    return {
      type: 'DROP',
      payload: args
    };
  };
  var dropPending = function dropPending(args) {
    return {
      type: 'DROP_PENDING',
      payload: args
    };
  };
  var dropAnimationFinished = function dropAnimationFinished() {
    return {
      type: 'DROP_ANIMATION_FINISHED',
      payload: null
    };
  };

  var lift$1 = (function (getMarshal) {
    return function (_ref) {
      var getState = _ref.getState,
        dispatch = _ref.dispatch;
      return function (next) {
        return function (action) {
          if (action.type !== 'LIFT') {
            next(action);
            return;
          }

          var marshal = getMarshal();
          var _action$payload = action.payload,
            id = _action$payload.id,
            clientSelection = _action$payload.clientSelection,
            movementMode = _action$payload.movementMode;
          var initial = getState();

          if (initial.phase === 'DROP_ANIMATING') {
            dispatch(completeDrop(initial.pending.result));
          }

          !(getState().phase === 'IDLE') ? invariant(false, 'Incorrect phase to start a drag') : void 0;
          var scrollOptions = {
            shouldPublishImmediately: movementMode === 'SNAP'
          };
          var request = {
            draggableId: id,
            scrollOptions: scrollOptions
          };

          var _marshal$startPublish = marshal.startPublishing(request),
            critical = _marshal$startPublish.critical,
            dimensions = _marshal$startPublish.dimensions,
            viewport = _marshal$startPublish.viewport;

          dispatch(initialPublish({
            critical: critical,
            dimensions: dimensions,
            clientSelection: clientSelection,
            movementMode: movementMode,
            viewport: viewport
          }));
        };
      };
    };
  });

  var style = (function (marshal) {
    return function () {
      return function (next) {
        return function (action) {
          if (action.type === 'INITIAL_PUBLISH') {
            marshal.dragging();
          }

          if (action.type === 'DROP_ANIMATE') {
            marshal.dropping(action.payload.result.reason);
          }

          if (action.type === 'CLEAN' || action.type === 'DROP_COMPLETE') {
            marshal.resting();
          }

          next(action);
        };
      };
    };
  });

  var minDropTime = 0.33;
  var maxDropTime = 0.55;
  var dropTimeRange = maxDropTime - minDropTime;
  var maxDropTimeAtDistance = 1500;
  var cancelDropModifier = 0.6;
  var getDropDuration = (function (_ref) {
    var current = _ref.current,
      destination = _ref.destination,
      reason = _ref.reason;
    var distance$$1 = distance(current, destination);

    if (distance$$1 <= 0) {
      return minDropTime;
    }

    if (distance$$1 >= maxDropTimeAtDistance) {
      return maxDropTime;
    }

    var percentage = distance$$1 / maxDropTimeAtDistance;
    var duration = minDropTime + dropTimeRange * percentage;
    var withDuration = reason === 'CANCEL' ? duration * cancelDropModifier : duration;
    return Number(withDuration.toFixed(2));
  });

  var getNewHomeClientOffset = (function (_ref) {
    var impact = _ref.impact,
      draggable = _ref.draggable,
      dimensions = _ref.dimensions,
      viewport = _ref.viewport;
    var draggables = dimensions.draggables,
      droppables = dimensions.droppables;
    var droppableId = whatIsDraggedOver(impact);
    var destination = droppableId ? droppables[droppableId] : null;
    var home = droppables[draggable.descriptor.droppableId];
    var newClientCenter = getClientBorderBoxCenter({
      impact: impact,
      draggable: draggable,
      draggables: draggables,
      droppable: destination || home,
      viewport: viewport
    });
    var offset = subtract(newClientCenter, draggable.client.borderBox.center);
    return offset;
  });

  var drop$1 = (function (_ref) {
    var getState = _ref.getState,
      dispatch = _ref.dispatch;
    return function (next) {
      return function (action) {
        if (action.type !== 'DROP') {
          next(action);
          return;
        }

        var state = getState();
        var reason = action.payload.reason;

        if (state.phase === 'COLLECTING') {
          dispatch(dropPending({
            reason: reason
          }));
          return;
        }

        if (state.phase === 'IDLE') {
          return;
        }

        var isWaitingForDrop = state.phase === 'DROP_PENDING' && state.isWaiting;
        !!isWaitingForDrop ? invariant(false, 'A DROP action occurred while DROP_PENDING and still waiting') : void 0;
        !(state.phase === 'DRAGGING' || state.phase === 'DROP_PENDING') ? invariant(false, "Cannot drop in phase: " + state.phase) : void 0;
        var critical = state.critical;
        var dimensions = state.dimensions;
        var impact = reason === 'DROP' ? state.impact : noImpact;
        var draggable = dimensions.draggables[state.critical.draggable.id];
        var destination = impact ? impact.destination : null;
        var combine = impact && impact.merge ? impact.merge.combine : null;
        var source = {
          index: critical.draggable.index,
          droppableId: critical.droppable.id
        };
        var result = {
          draggableId: draggable.descriptor.id,
          type: draggable.descriptor.type,
          source: source,
          mode: state.movementMode,
          destination: destination,
          combine: combine,
          reason: reason
        };
        var newHomeClientOffset = getNewHomeClientOffset({
          impact: impact,
          draggable: draggable,
          dimensions: dimensions,
          viewport: state.viewport
        });
        var isAnimationRequired = !isEqual(state.current.client.offset, newHomeClientOffset) || Boolean(result.combine);

        if (!isAnimationRequired) {
          dispatch(completeDrop(result));
          return;
        }

        var dropDuration = getDropDuration({
          current: state.current.client.offset,
          destination: newHomeClientOffset,
          reason: reason
        });
        var pending = {
          newHomeClientOffset: newHomeClientOffset,
          dropDuration: dropDuration,
          result: result,
          impact: impact
        };
        dispatch(animateDrop(pending));
      };
    };
  });

  var position = function position(index) {
    return index + 1;
  };

  var onDragStart = function onDragStart(start) {
    return "\n  You have lifted an item in position " + position(start.source.index) + ".\n  Use the arrow keys to move, space bar to drop, and escape to cancel.\n";
  };

  var withLocation = function withLocation(source, destination) {
    var isInHomeList = source.droppableId === destination.droppableId;
    var startPosition = position(source.index);
    var endPosition = position(destination.index);

    if (isInHomeList) {
      return "\n      You have moved the item from position " + startPosition + "\n      to position " + endPosition + "\n    ";
    }

    return "\n    You have moved the item from position " + startPosition + "\n    in list " + source.droppableId + "\n    to list " + destination.droppableId + "\n    in position " + endPosition + "\n  ";
  };

  var withCombine = function withCombine(id, source, combine) {
    var inHomeList = source.droppableId === combine.droppableId;

    if (inHomeList) {
      return "\n      The item " + id + "\n      has been combined with " + combine.draggableId;
    }

    return "\n      The item " + id + "\n      in list " + source.droppableId + "\n      has been combined with " + combine.draggableId + "\n      in list " + combine.droppableId + "\n    ";
  };

  var onDragUpdate = function onDragUpdate(update) {
    var location = update.destination;

    if (location) {
      return withLocation(update.source, location);
    }

    var combine = update.combine;

    if (combine) {
      return withCombine(update.draggableId, update.source, combine);
    }

    return 'You are over an area that cannot be dropped on';
  };

  var returnedToStart = function returnedToStart(source) {
    return "\n  The item has returned to its starting position\n  of " + position(source.index) + "\n";
  };

  var onDragEnd = function onDragEnd(result) {
    if (result.reason === 'CANCEL') {
      return "\n      Movement cancelled.\n      " + returnedToStart(result.source) + "\n    ";
    }

    var location = result.destination;
    var combine = result.combine;

    if (location) {
      return "\n      You have dropped the item.\n      " + withLocation(result.source, location) + "\n    ";
    }

    if (combine) {
      return "\n      You have dropped the item.\n      " + withCombine(result.draggableId, result.source, combine) + "\n    ";
    }

    return "\n    The item has been dropped while not over a drop area.\n    " + returnedToStart(result.source) + "\n  ";
  };

  var preset = {
    onDragStart: onDragStart,
    onDragUpdate: onDragUpdate,
    onDragEnd: onDragEnd
  };

  var spacesAndTabs = /[ \t]{2,}/g;

  var clean$1 = function clean(value) {
    return value.replace(spacesAndTabs, ' ').trim();
  };

  var getDevMessage = function getDevMessage(message) {
    return clean$1("\n  %creact-beautiful-dnd\n\n  %c" + clean$1(message) + "\n\n  %c\uD83D\uDC77\u200D This is a development only message. It will be removed in production builds.\n");
  };

  var getFormattedMessage = function getFormattedMessage(message) {
    return [getDevMessage(message), 'color: #00C584; font-size: 1.2em; font-weight: bold;', 'line-height: 1.5', 'color: #723874;'];
  };
  var isDisabledFlag = '__react-beautiful-dnd-disable-dev-warnings';
  var warning$3 = function warning(message) {
    var _console;

    if (typeof window !== 'undefined' && window[isDisabledFlag]) {
      return;
    }

    (_console = console).warn.apply(_console, getFormattedMessage(message));
  };

  var getExpiringAnnounce = (function (announce) {
    var wasCalled = false;
    var isExpired = false;
    var timeoutId = setTimeout(function () {
      isExpired = true;
    });

    var result = function result(message) {
      if (wasCalled) {
        warning$3('Announcement already made. Not making a second announcement');
        return;
      }

      if (isExpired) {
        warning$3("\n        Announcements cannot be made asynchronously.\n        Default message has already been announced.\n      ");
        return;
      }

      wasCalled = true;
      announce(message);
      clearTimeout(timeoutId);
    };

    result.wasCalled = function () {
      return wasCalled;
    };

    return result;
  });

  var getAsyncMarshal = (function () {
    var entries = [];

    var execute = function execute(timerId) {
      var index = findIndex(entries, function (item) {
        return item.timerId === timerId;
      });
      !(index !== -1) ? invariant(false, 'Could not find timer') : void 0;

      var _entries$splice = entries.splice(index, 1),
        entry = _entries$splice[0];

      entry.callback();
    };

    var add = function add(fn) {
      var timerId = setTimeout(function () {
        return execute(timerId);
      });
      var entry = {
        timerId: timerId,
        callback: fn
      };
      entries.push(entry);
    };

    var flush = function flush() {
      if (!entries.length) {
        return;
      }

      var shallow = entries.concat();
      entries.length = 0;
      shallow.forEach(function (entry) {
        clearTimeout(entry.timerId);
        entry.callback();
      });
    };

    return {
      add: add,
      flush: flush
    };
  });

  var areLocationsEqual = function areLocationsEqual(first, second) {
    if (first == null && second == null) {
      return true;
    }

    if (first == null || second == null) {
      return false;
    }

    return first.droppableId === second.droppableId && first.index === second.index;
  };
  var isCombineEqual = function isCombineEqual(first, second) {
    if (first == null && second == null) {
      return true;
    }

    if (first == null || second == null) {
      return false;
    }

    return first.draggableId === second.draggableId && first.droppableId === second.droppableId;
  };
  var isCriticalEqual = function isCriticalEqual(first, second) {
    if (first === second) {
      return true;
    }

    var isDraggableEqual = first.draggable.id === second.draggable.id && first.draggable.droppableId === second.draggable.droppableId && first.draggable.type === second.draggable.type && first.draggable.index === second.draggable.index;
    var isDroppableEqual = first.droppable.id === second.droppable.id && first.droppable.type === second.droppable.type;
    return isDraggableEqual && isDroppableEqual;
  };

  var withTimings = function withTimings(key, fn) {
    start(key);
    fn();
    finish(key);
  };

  var getDragStart = function getDragStart(critical, mode) {
    return {
      draggableId: critical.draggable.id,
      type: critical.droppable.type,
      source: {
        droppableId: critical.droppable.id,
        index: critical.draggable.index
      },
      mode: mode
    };
  };

  var execute = function execute(responder, data, announce, getDefaultMessage) {
    if (!responder) {
      announce(getDefaultMessage(data));
      return;
    }

    var willExpire = getExpiringAnnounce(announce);
    var provided = {
      announce: willExpire
    };
    responder(data, provided);

    if (!willExpire.wasCalled()) {
      announce(getDefaultMessage(data));
    }
  };

  var getPublisher = (function (getResponders, announce) {
    var asyncMarshal = getAsyncMarshal();
    var dragging = null;

    var beforeStart = function beforeStart(critical, mode) {
      !!dragging ? invariant(false, 'Cannot fire onBeforeDragStart as a drag start has already been published') : void 0;
      withTimings('onBeforeDragStart', function () {
        var fn = getResponders().onBeforeDragStart;

        if (fn) {
          fn(getDragStart(critical, mode));
        }
      });
    };

    var start$$1 = function start$$1(critical, mode) {
      !!dragging ? invariant(false, 'Cannot fire onBeforeDragStart as a drag start has already been published') : void 0;
      var data = getDragStart(critical, mode);
      dragging = {
        mode: mode,
        lastCritical: critical,
        lastLocation: data.source,
        lastCombine: null
      };
      asyncMarshal.add(function () {
        withTimings('onDragStart', function () {
          return execute(getResponders().onDragStart, data, announce, preset.onDragStart);
        });
      });
    };

    var update = function update(critical, impact) {
      var location = impact.destination;
      var combine = impact.merge ? impact.merge.combine : null;
      !dragging ? invariant(false, 'Cannot fire onDragMove when onDragStart has not been called') : void 0;
      var hasCriticalChanged = !isCriticalEqual(critical, dragging.lastCritical);

      if (hasCriticalChanged) {
        dragging.lastCritical = critical;
      }

      var hasLocationChanged = !areLocationsEqual(dragging.lastLocation, location);

      if (hasLocationChanged) {
        dragging.lastLocation = location;
      }

      var hasGroupingChanged = !isCombineEqual(dragging.lastCombine, combine);

      if (hasGroupingChanged) {
        dragging.lastCombine = combine;
      }

      if (!hasCriticalChanged && !hasLocationChanged && !hasGroupingChanged) {
        return;
      }

      var data = _extends({}, getDragStart(critical, dragging.mode), {
        combine: combine,
        destination: location
      });

      asyncMarshal.add(function () {
        withTimings('onDragUpdate', function () {
          return execute(getResponders().onDragUpdate, data, announce, preset.onDragUpdate);
        });
      });
    };

    var flush = function flush() {
      !dragging ? invariant(false, 'Can only flush responders while dragging') : void 0;
      asyncMarshal.flush();
    };

    var drop = function drop(result) {
      !dragging ? invariant(false, 'Cannot fire onDragEnd when there is no matching onDragStart') : void 0;
      dragging = null;
      withTimings('onDragEnd', function () {
        return execute(getResponders().onDragEnd, result, announce, preset.onDragEnd);
      });
    };

    var abort = function abort() {
      if (!dragging) {
        return;
      }

      var result = _extends({}, getDragStart(dragging.lastCritical, dragging.mode), {
        combine: null,
        destination: null,
        reason: 'CANCEL'
      });

      drop(result);
    };

    return {
      beforeStart: beforeStart,
      start: start$$1,
      update: update,
      flush: flush,
      drop: drop,
      abort: abort
    };
  });

  var responders = (function (getResponders, announce) {
    var publisher = getPublisher(getResponders, announce);
    return function (store) {
      return function (next) {
        return function (action) {
          if (action.type === 'INITIAL_PUBLISH') {
            var critical = action.payload.critical;
            publisher.beforeStart(critical, action.payload.movementMode);
            next(action);
            publisher.start(critical, action.payload.movementMode);
            return;
          }

          if (action.type === 'DROP_COMPLETE') {
            var result = action.payload;
            publisher.flush();
            next(action);
            publisher.drop(result);
            return;
          }

          next(action);

          if (action.type === 'CLEAN') {
            publisher.abort();
            return;
          }

          var state = store.getState();

          if (state.phase === 'DRAGGING') {
            publisher.update(state.critical, state.impact);
          }
        };
      };
    };
  });

  var dropAnimationFinish = (function (store) {
    return function (next) {
      return function (action) {
        if (action.type !== 'DROP_ANIMATION_FINISHED') {
          next(action);
          return;
        }

        var state = store.getState();
        !(state.phase === 'DROP_ANIMATING') ? invariant(false, 'Cannot finish a drop animating when no drop is occurring') : void 0;
        store.dispatch(completeDrop(state.pending.result));
      };
    };
  });

  var dimensionMarshalStopper = (function (getMarshal) {
    return function () {
      return function (next) {
        return function (action) {
          if (action.type === 'DROP_COMPLETE' || action.type === 'CLEAN' || action.type === 'DROP_ANIMATE') {
            var marshal = getMarshal();
            marshal.stopPublishing();
          }

          next(action);
        };
      };
    };
  });

  var shouldEnd = function shouldEnd(action) {
    return action.type === 'DROP_COMPLETE' || action.type === 'DROP_ANIMATE' || action.type === 'CLEAN';
  };

  var shouldCancelPending = function shouldCancelPending(action) {
    return action.type === 'COLLECTION_STARTING';
  };

  var autoScroll = (function (getScroller) {
    return function (store) {
      return function (next) {
        return function (action) {
          if (shouldEnd(action)) {
            getScroller().stop();
            next(action);
            return;
          }

          if (shouldCancelPending(action)) {
            getScroller().cancelPending();
            next(action);
            return;
          }

          if (action.type === 'INITIAL_PUBLISH') {
            next(action);
            var state = store.getState();
            !(state.phase === 'DRAGGING') ? invariant(false, 'Expected phase to be DRAGGING after INITIAL_PUBLISH') : void 0;
            getScroller().start(state);
            return;
          }

          next(action);
          getScroller().scroll(store.getState());
        };
      };
    };
  });

  var pendingDrop = (function (store) {
    return function (next) {
      return function (action) {
        next(action);

        if (action.type !== 'PUBLISH_WHILE_DRAGGING') {
          return;
        }

        var postActionState = store.getState();

        if (postActionState.phase !== 'DROP_PENDING') {
          return;
        }

        if (postActionState.isWaiting) {
          return;
        }

        store.dispatch(drop({
          reason: postActionState.reason
        }));
      };
    };
  });

  var getDocumentElement = (function () {
    var doc = document.documentElement;
    !doc ? invariant(false, 'Cannot find document.documentElement') : void 0;
    return doc;
  });

  var getMaxWindowScroll = (function () {
    var doc = getDocumentElement();
    var maxScroll = getMaxScroll({
      scrollHeight: doc.scrollHeight,
      scrollWidth: doc.scrollWidth,
      width: doc.clientWidth,
      height: doc.clientHeight
    });
    return maxScroll;
  });

  var shouldCheckOnAction = function shouldCheckOnAction(action) {
    return action.type === 'MOVE' || action.type === 'MOVE_UP' || action.type === 'MOVE_RIGHT' || action.type === 'MOVE_DOWN' || action.type === 'MOVE_LEFT' || action.type === 'MOVE_BY_WINDOW_SCROLL';
  };

  var wasDestinationChange = function wasDestinationChange(previous, current, action) {
    if (!shouldCheckOnAction(action)) {
      return false;
    }

    if (!isMovementAllowed(previous) || !isMovementAllowed(current)) {
      return false;
    }

    if (whatIsDraggedOver(previous.impact) === whatIsDraggedOver(current.impact)) {
      return false;
    }

    return true;
  };

  var getUpdatedViewportMax = function getUpdatedViewportMax(viewport) {
    var maxScroll = getMaxWindowScroll();

    if (isEqual(viewport.scroll.max, maxScroll)) {
      return null;
    }

    return maxScroll;
  };

  var updateViewportMaxScrollOnDestinationChange = (function (store) {
    return function (next) {
      return function (action) {
        var previous = store.getState();
        next(action);
        var current = store.getState();

        if (!current.isDragging) {
          return;
        }

        if (!wasDestinationChange(previous, current, action)) {
          return;
        }

        var maxScroll = getUpdatedViewportMax(current.viewport);

        if (maxScroll) {
          next(updateViewportMaxScroll({
            maxScroll: maxScroll
          }));
        }
      };
    };
  });

  var composeEnhancers = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
  var createStore$1 = (function (_ref) {
    var getDimensionMarshal = _ref.getDimensionMarshal,
      styleMarshal = _ref.styleMarshal,
      getResponders = _ref.getResponders,
      announce = _ref.announce,
      getScroller = _ref.getScroller;
    return createStore(reducer, composeEnhancers(applyMiddleware(style(styleMarshal), dimensionMarshalStopper(getDimensionMarshal), lift$1(getDimensionMarshal), drop$1, dropAnimationFinish, pendingDrop, updateViewportMaxScrollOnDestinationChange, autoScroll(getScroller), responders(getResponders, announce))));
  });

  // most Object methods by ES6 should accept primitives



  var _objectSap = function (KEY, exec) {
    var fn = (_core.Object || {})[KEY] || Object[KEY];
    var exp = {};
    exp[KEY] = exec(fn);
    _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
  };

  // 19.1.2.14 Object.keys(O)



  _objectSap('keys', function () {
    return function keys(it) {
      return _objectKeys(_toObject(it));
    };
  });

  var keys = _core.Object.keys;

  var keys$1 = keys;

  var clean$2 = function clean() {
    return {
      additions: {},
      removals: {},
      modified: {}
    };
  };

  var timingKey = 'Publish collection from DOM';
  var createPublisher = (function (_ref) {
    var getEntries = _ref.getEntries,
      callbacks = _ref.callbacks;

    var advancedUsageWarning = function () {

      var hasAnnounced = false;
      return function () {
        if (hasAnnounced) {
          return;
        }

        hasAnnounced = true;
        warning$3("\n        Advanced usage warning: you are adding or removing a dimension during a drag\n        This an advanced feature.\n\n        More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/changes-while-dragging.md\n      ");
      };
    }();

    var staging = clean$2();
    var frameId = null;

    var collect = function collect() {
      advancedUsageWarning();

      if (frameId) {
        return;
      }

      frameId = requestAnimationFrame(function () {
        frameId = null;
        callbacks.collectionStarting();
        start(timingKey);
        var entries = getEntries();
        var _staging = staging,
          additions = _staging.additions,
          removals = _staging.removals,
          modified = _staging.modified;

        var added = keys$1(additions).map(function (id) {
          return entries.draggables[id].getDimension(origin);
        }).sort(function (a, b) {
          return a.descriptor.index - b.descriptor.index;
        });

        var updated = keys$1(modified).map(function (id) {
          var entry = entries.droppables[id];
          !entry ? invariant(false, 'Cannot find dynamically added droppable in cache') : void 0;
          return entry.callbacks.recollect();
        });

        var result = {
          additions: added,
          removals: keys$1(removals),
          modified: updated
        };
        staging = clean$2();
        finish(timingKey);
        callbacks.publish(result);
      });
    };

    var add$$1 = function add$$1(descriptor) {
      staging.additions[descriptor.id] = descriptor;
      staging.modified[descriptor.droppableId] = true;

      if (staging.removals[descriptor.id]) {
        delete staging.removals[descriptor.id];
      }

      collect();
    };

    var remove = function remove(descriptor) {
      staging.removals[descriptor.id] = descriptor;
      staging.modified[descriptor.droppableId] = true;

      if (staging.additions[descriptor.id]) {
        delete staging.additions[descriptor.id];
      }

      collect();
    };

    var stop = function stop() {
      if (!frameId) {
        return;
      }

      cancelAnimationFrame(frameId);
      frameId = null;
      staging = clean$2();
    };

    return {
      add: add$$1,
      remove: remove,
      stop: stop
    };
  });

  var getWindowScroll$1 = (function () {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset
    };
  });

  var getViewport = (function () {
    var scroll = getWindowScroll$1();
    var maxScroll = getMaxWindowScroll();
    var top = scroll.y;
    var left = scroll.x;
    var doc = getDocumentElement();
    var width = doc.clientWidth;
    var height = doc.clientHeight;
    var right = left + width;
    var bottom = top + height;
    var frame = getRect({
      top: top,
      left: left,
      right: right,
      bottom: bottom
    });
    var viewport = {
      frame: frame,
      scroll: {
        initial: scroll,
        current: scroll,
        max: maxScroll,
        diff: {
          value: origin,
          displacement: origin
        }
      }
    };
    return viewport;
  });

  var getInitialPublish = (function (_ref) {
    var critical = _ref.critical,
      scrollOptions = _ref.scrollOptions,
      entries = _ref.entries;
    var timingKey = 'Initial collection from DOM';
    start(timingKey);
    var viewport = getViewport();
    var windowScroll = viewport.scroll.current;
    var home = critical.droppable;
    var droppables = values$2(entries.droppables).filter(function (entry) {
      return entry.descriptor.type === home.type;
    }).map(function (entry) {
      return entry.callbacks.getDimensionAndWatchScroll(windowScroll, scrollOptions);
    });
    var draggables = values$2(entries.draggables).filter(function (entry) {
      return entry.descriptor.type === critical.draggable.type;
    }).map(function (entry) {
      return entry.getDimension(windowScroll);
    });
    var dimensions = {
      draggables: toDraggableMap(draggables),
      droppables: toDroppableMap(droppables)
    };
    finish(timingKey);
    var result = {
      dimensions: dimensions,
      critical: critical,
      viewport: viewport
    };
    return result;
  });

  var throwIfAddOrRemoveOfWrongType = function throwIfAddOrRemoveOfWrongType(collection, descriptor) {
    !(collection.critical.draggable.type === descriptor.type) ? invariant(false, "We have detected that you have added a Draggable during a drag.\n      This is not of the same type as the dragging item\n\n      Dragging type: " + collection.critical.draggable.type + ".\n      Added type: " + descriptor.type + "\n\n      We are not allowing this as you can run into problems if your change\n      has shifted the positioning of other Droppables, or has changed the size of the page") : void 0;
  };

  var createDimensionMarshal = (function (callbacks) {
    var entries = {
      droppables: {},
      draggables: {}
    };
    var collection = null;
    var publisher = createPublisher({
      callbacks: {
        publish: callbacks.publishWhileDragging,
        collectionStarting: callbacks.collectionStarting
      },
      getEntries: function getEntries() {
        return entries;
      }
    });

    var registerDraggable = function registerDraggable(descriptor, getDimension) {
      var entry = {
        descriptor: descriptor,
        getDimension: getDimension
      };
      entries.draggables[descriptor.id] = entry;

      if (!collection) {
        return;
      }

      throwIfAddOrRemoveOfWrongType(collection, descriptor);
      publisher.add(descriptor);
    };

    var updateDraggable = function updateDraggable(previous, descriptor, getDimension) {
      !entries.draggables[previous.id] ? invariant(false, 'Cannot update draggable registration as no previous registration was found') : void 0;
      delete entries.draggables[previous.id];
      var entry = {
        descriptor: descriptor,
        getDimension: getDimension
      };
      entries.draggables[descriptor.id] = entry;
    };

    var unregisterDraggable = function unregisterDraggable(descriptor) {
      var entry = entries.draggables[descriptor.id];
      !entry ? invariant(false, "Cannot unregister Draggable with id:\n      " + descriptor.id + " as it is not registered") : void 0;

      if (entry.descriptor !== descriptor) {
        return;
      }

      delete entries.draggables[descriptor.id];

      if (!collection) {
        return;
      }

      !(collection.critical.draggable.id !== descriptor.id) ? invariant(false, 'Cannot remove the dragging item during a drag') : void 0;
      throwIfAddOrRemoveOfWrongType(collection, descriptor);
      publisher.remove(descriptor);
    };

    var registerDroppable = function registerDroppable(descriptor, droppableCallbacks) {
      var id = descriptor.id;
      entries.droppables[id] = {
        descriptor: descriptor,
        callbacks: droppableCallbacks
      };
      !!collection ? invariant(false, 'Cannot add a Droppable during a drag') : void 0;
    };

    var updateDroppable = function updateDroppable(previous, descriptor, droppableCallbacks) {
      !entries.droppables[previous.id] ? invariant(false, 'Cannot update droppable registration as no previous registration was found') : void 0;
      delete entries.droppables[previous.id];
      var entry = {
        descriptor: descriptor,
        callbacks: droppableCallbacks
      };
      entries.droppables[descriptor.id] = entry;
      !!collection ? invariant(false, 'You are not able to update the id or type of a droppable during a drag') : void 0;
    };

    var unregisterDroppable = function unregisterDroppable(descriptor) {
      var entry = entries.droppables[descriptor.id];
      !entry ? invariant(false, "Cannot unregister Droppable with id " + descriptor.id + " as as it is not registered") : void 0;

      if (entry.descriptor !== descriptor) {
        return;
      }

      delete entries.droppables[descriptor.id];
      !!collection ? invariant(false, 'Cannot add a Droppable during a drag') : void 0;
    };

    var updateDroppableIsEnabled = function updateDroppableIsEnabled(id, isEnabled) {
      !entries.droppables[id] ? invariant(false, "Cannot update is enabled flag of Droppable " + id + " as it is not registered") : void 0;

      if (!collection) {
        return;
      }

      callbacks.updateDroppableIsEnabled({
        id: id,
        isEnabled: isEnabled
      });
    };

    var updateDroppableIsCombineEnabled = function updateDroppableIsCombineEnabled(id, isCombineEnabled) {
      !entries.droppables[id] ? invariant(false, "Cannot update isCombineEnabled flag of Droppable " + id + " as it is not registered") : void 0;

      if (!collection) {
        return;
      }

      callbacks.updateDroppableIsCombineEnabled({
        id: id,
        isCombineEnabled: isCombineEnabled
      });
    };

    var updateDroppableScroll = function updateDroppableScroll(id, newScroll) {
      !entries.droppables[id] ? invariant(false, "Cannot update the scroll on Droppable " + id + " as it is not registered") : void 0;

      if (!collection) {
        return;
      }

      callbacks.updateDroppableScroll({
        id: id,
        offset: newScroll
      });
    };

    var scrollDroppable = function scrollDroppable(id, change) {
      var entry = entries.droppables[id];
      !entry ? invariant(false, "Cannot scroll Droppable " + id + " as it is not registered") : void 0;

      if (!collection) {
        return;
      }

      entry.callbacks.scroll(change);
    };

    var stopPublishing = function stopPublishing() {
      if (!collection) {
        return;
      }

      publisher.stop();
      var home = collection.critical.droppable;
      values$2(entries.droppables).filter(function (entry) {
        return entry.descriptor.type === home.type;
      }).forEach(function (entry) {
        return entry.callbacks.dragStopped();
      });
      collection = null;
    };

    var startPublishing = function startPublishing(request) {
      !!collection ? invariant(false, 'Cannot start capturing critical dimensions as there is already a collection') : void 0;
      var entry = entries.draggables[request.draggableId];
      !entry ? invariant(false, 'Cannot find critical draggable entry') : void 0;
      var home = entries.droppables[entry.descriptor.droppableId];
      !home ? invariant(false, 'Cannot find critical droppable entry') : void 0;
      var critical = {
        draggable: entry.descriptor,
        droppable: home.descriptor
      };
      collection = {
        critical: critical
      };
      return getInitialPublish({
        critical: critical,
        entries: entries,
        scrollOptions: request.scrollOptions
      });
    };

    var marshal = {
      registerDraggable: registerDraggable,
      updateDraggable: updateDraggable,
      unregisterDraggable: unregisterDraggable,
      registerDroppable: registerDroppable,
      updateDroppable: updateDroppable,
      unregisterDroppable: unregisterDroppable,
      updateDroppableIsEnabled: updateDroppableIsEnabled,
      updateDroppableIsCombineEnabled: updateDroppableIsCombineEnabled,
      scrollDroppable: scrollDroppable,
      updateDroppableScroll: updateDroppableScroll,
      startPublishing: startPublishing,
      stopPublishing: stopPublishing
    };
    return marshal;
  });

  var curves = {
    outOfTheWay: 'cubic-bezier(0.2, 0, 0, 1)',
    drop: 'cubic-bezier(.2,1,.1,1)'
  };
  var combine = {
    opacity: {
      drop: 0,
      combining: 0.7
    },
    scale: {
      drop: 0.75
    }
  };
  var outOfTheWayTime = 0.2;
  var outOfTheWayTiming = outOfTheWayTime + "s " + curves.outOfTheWay;
  var transitions = {
    fluid: "opacity " + outOfTheWayTiming,
    snap: "transform " + outOfTheWayTiming + ", opacity " + outOfTheWayTiming,
    drop: function drop(duration) {
      var timing = duration + "s " + curves.drop;
      return "transform " + timing + ", opacity " + timing;
    },
    outOfTheWay: "transform " + outOfTheWayTiming
  };

  var moveTo = function moveTo(offset) {
    return isEqual(offset, origin) ? null : "translate(" + offset.x + "px, " + offset.y + "px)";
  };

  var transforms = {
    moveTo: moveTo,
    drop: function drop(offset, isCombining) {
      var translate = moveTo(offset);

      if (!translate) {
        return null;
      }

      if (!isCombining) {
        return translate;
      }

      return translate + " scale(" + combine.scale.drop + ")";
    }
  };

  var prefix$1 = 'data-react-beautiful-dnd';
  var dragHandle = prefix$1 + "-drag-handle";
  var draggable = prefix$1 + "-draggable";
  var droppable = prefix$1 + "-droppable";

  var makeGetSelector = function makeGetSelector(context) {
    return function (attribute) {
      return "[" + attribute + "=\"" + context + "\"]";
    };
  };

  var getStyles = function getStyles(rules, property) {
    return rules.map(function (rule) {
      var value = rule.styles[property];

      if (!value) {
        return '';
      }

      return rule.selector + " { " + value + " }";
    }).join(' ');
  };

  var noPointerEvents = 'pointer-events: none;';
  var getStyles$1 = (function (styleContext) {
    var getSelector = makeGetSelector(styleContext);

    var dragHandle$$1 = function () {
      var grabCursor = "\n      cursor: -webkit-grab;\n      cursor: grab;\n    ";
      return {
        selector: getSelector(dragHandle),
        styles: {
          always: "\n          -webkit-touch-callout: none;\n          -webkit-tap-highlight-color: rgba(0,0,0,0);\n          touch-action: manipulation;\n        ",
          resting: grabCursor,
          dragging: noPointerEvents,
          dropAnimating: grabCursor
        }
      };
    }();

    var draggable$$1 = function () {
      var transition = "\n      transition: " + transitions.outOfTheWay + ";\n    ";
      return {
        selector: getSelector(draggable),
        styles: {
          dragging: transition,
          dropAnimating: transition,
          userCancel: transition
        }
      };
    }();

    var droppable$$1 = {
      selector: getSelector(droppable),
      styles: {
        always: "overflow-anchor: none;"
      }
    };
    var body = {
      selector: 'body',
      styles: {
        dragging: "\n        cursor: grabbing;\n        cursor: -webkit-grabbing;\n        user-select: none;\n        -webkit-user-select: none;\n        -moz-user-select: none;\n        -ms-user-select: none;\n        overflow-anchor: none;\n      "
      }
    };
    var rules = [draggable$$1, dragHandle$$1, droppable$$1, body];
    return {
      always: getStyles(rules, 'always'),
      resting: getStyles(rules, 'resting'),
      dragging: getStyles(rules, 'dragging'),
      dropAnimating: getStyles(rules, 'dropAnimating'),
      userCancel: getStyles(rules, 'userCancel')
    };
  });

  var count = 0;
  var resetStyleContext = function resetStyleContext() {
    count = 0;
  };

  var getHead = function getHead() {
    var head = document.querySelector('head');
    !head ? invariant(false, 'Cannot find the head to append a style to') : void 0;
    return head;
  };

  var createStyleEl = function createStyleEl() {
    var el = document.createElement('style');
    el.type = 'text/css';
    return el;
  };

  var createStyleMarshal = (function () {
    var context = "" + count++;
    var styles = getStyles$1(context);
    var always = null;
    var dynamic = null;
    var setStyle = index(function (el, proposed) {
      !el ? invariant(false, 'Cannot set style of style tag if not mounted') : void 0;
      el.innerHTML = proposed;
    });

    var mount = function mount() {
      !(!always && !dynamic) ? invariant(false, 'Style marshal already mounted') : void 0;
      always = createStyleEl();
      dynamic = createStyleEl();
      always.setAttribute(prefix$1 + "-always", context);
      dynamic.setAttribute(prefix$1 + "-dynamic", context);
      getHead().appendChild(always);
      getHead().appendChild(dynamic);
      setStyle(always, styles.always);
      setStyle(dynamic, styles.resting);
    };

    var dragging = function dragging() {
      return setStyle(dynamic, styles.dragging);
    };

    var dropping = function dropping(reason) {
      if (reason === 'DROP') {
        setStyle(dynamic, styles.dropAnimating);
        return;
      }

      setStyle(dynamic, styles.userCancel);
    };

    var resting = function resting() {
      return setStyle(dynamic, styles.resting);
    };

    var unmount = function unmount() {
      !(always && dynamic) ? invariant(false, 'Cannot unmount style marshal as it is already unmounted') : void 0;
      getHead().removeChild(always);
      getHead().removeChild(dynamic);
      always = null;
      dynamic = null;
    };

    var marshal = {
      dragging: dragging,
      dropping: dropping,
      resting: resting,
      styleContext: context,
      mount: mount,
      unmount: unmount
    };
    return marshal;
  });

  var canStartDrag = (function (state, id) {
    if (state.phase === 'IDLE') {
      return true;
    }

    if (state.phase !== 'DROP_ANIMATING') {
      return false;
    }

    if (state.pending.result.draggableId === id) {
      return false;
    }

    return state.pending.result.reason === 'DROP';
  });

  var scrollWindow = (function (change) {
    window.scrollBy(change.x, change.y);
  });

  var getBodyElement = (function () {
    var body = document.body;
    !body ? invariant(false, 'Cannot find document.body') : void 0;
    return body;
  });

  var count$1 = 0;
  var visuallyHidden = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    border: '0',
    padding: '0',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    'clip-path': 'inset(100%)'
  };
  var createAnnouncer = (function () {
    var id = "react-beautiful-dnd-announcement-" + count$1++;
    var el = null;

    var announce = function announce(message) {
      if (el) {
        el.textContent = message;
        return;
      }

      warning$3("\n      A screen reader message was trying to be announced but it was unable to do so.\n      This can occur if you unmount your <DragDropContext /> in your onDragEnd.\n      Consider calling provided.announce() before the unmount so that the instruction will\n      not be lost for users relying on a screen reader.\n\n      Message not passed to screen reader:\n\n      \"" + message + "\"\n    ");
    };

    var mount = function mount() {
      !!el ? invariant(false, 'Announcer already mounted') : void 0;
      el = document.createElement('div');
      el.id = id;
      el.setAttribute('aria-live', 'assertive');
      el.setAttribute('role', 'log');
      el.setAttribute('aria-atomic', 'true');

      assign$1(el.style, visuallyHidden);

      getBodyElement().appendChild(el);
    };

    var unmount = function unmount() {
      !el ? invariant(false, 'Will not unmount announcer as it is already unmounted') : void 0;
      getBodyElement().removeChild(el);
      el = null;
    };

    var announcer = {
      announce: announce,
      id: id,
      mount: mount,
      unmount: unmount
    };
    return announcer;
  });

  // 20.3.3.1 / 15.9.4.4 Date.now()


  _export(_export.S, 'Date', { now: function () { return new Date().getTime(); } });

  var now = _core.Date.now;

  var now$1 = now;

  var index$1 = (function (fn) {
    var lastArgs = [];
    var frameId = null;

    var wrapperFn = function wrapperFn() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      lastArgs = args;

      if (frameId) {
        return;
      }

      frameId = requestAnimationFrame(function () {
        frameId = null;
        fn.apply(undefined, lastArgs);
      });
    };

    wrapperFn.cancel = function () {
      if (!frameId) {
        return;
      }

      cancelAnimationFrame(frameId);
      frameId = null;
    };

    var resultFn = wrapperFn;

    return resultFn;
  });

  var getScrollableDroppables = index(function (droppables) {
    return toDroppableList(droppables).filter(function (droppable) {
      if (!droppable.isEnabled) {
        return false;
      }

      if (!droppable.frame) {
        return false;
      }

      return true;
    });
  });

  var getScrollableDroppableOver = function getScrollableDroppableOver(target, droppables) {
    var maybe = find(getScrollableDroppables(droppables), function (droppable) {
      !droppable.frame ? invariant(false, 'Invalid result') : void 0;
      return isPositionInFrame(droppable.frame.pageMarginBox)(target);
    });
    return maybe;
  };

  var getBestScrollableDroppable = (function (_ref) {
    var center = _ref.center,
      destination = _ref.destination,
      droppables = _ref.droppables;

    if (destination) {
      var _dimension = droppables[destination];

      if (!_dimension.frame) {
        return null;
      }

      return _dimension;
    }

    var dimension = getScrollableDroppableOver(center, droppables);
    return dimension;
  });

  var config = {
    startFromPercentage: 0.25,
    maxScrollAtPercentage: 0.05,
    maxPixelScroll: 28,
    ease: function ease(percentage) {
      return Math.pow(percentage, 2);
    },
    durationDampening: {
      stopDampeningAt: 1200,
      accelerateAt: 360
    }
  };

  var getDistanceThresholds = (function (container, axis) {
    var startScrollingFrom = container[axis.size] * config.startFromPercentage;
    var maxScrollValueAt = container[axis.size] * config.maxScrollAtPercentage;
    var thresholds = {
      startScrollingFrom: startScrollingFrom,
      maxScrollValueAt: maxScrollValueAt
    };
    return thresholds;
  });

  var getPercentage = (function (_ref) {
    var startOfRange = _ref.startOfRange,
      endOfRange = _ref.endOfRange,
      current = _ref.current;
    var range = endOfRange - startOfRange;

    if (range === 0) {
      warning$3("\n      Detected distance range of 0 in the fluid auto scroller\n      This is unexpected and would cause a divide by 0 issue.\n      Not allowing an auto scroll\n    ");
      return 0;
    }

    var currentInRange = current - startOfRange;
    var percentage = currentInRange / range;
    return percentage;
  });

  var minScroll = 1;

  var getValueFromDistance = (function (distanceToEdge, thresholds) {
    if (distanceToEdge > thresholds.startScrollingFrom) {
      return 0;
    }

    if (distanceToEdge <= thresholds.maxScrollValueAt) {
      return config.maxPixelScroll;
    }

    if (distanceToEdge === thresholds.startScrollingFrom) {
      return minScroll;
    }

    var percentageFromMaxScrollValueAt = getPercentage({
      startOfRange: thresholds.maxScrollValueAt,
      endOfRange: thresholds.startScrollingFrom,
      current: distanceToEdge
    });
    var percentageFromStartScrollingFrom = 1 - percentageFromMaxScrollValueAt;
    var scroll = config.maxPixelScroll * config.ease(percentageFromStartScrollingFrom);
    return Math.ceil(scroll);
  });

  var accelerateAt = config.durationDampening.accelerateAt;
  var stopAt = config.durationDampening.stopDampeningAt;
  var dampenValueByTime = (function (proposedScroll, dragStartTime) {
    var startOfRange = dragStartTime;
    var endOfRange = stopAt;

    var now = now$1();

    var runTime = now - startOfRange;

    if (runTime >= stopAt) {
      return proposedScroll;
    }

    if (runTime < accelerateAt) {
      return minScroll;
    }

    var betweenAccelerateAtAndStopAtPercentage = getPercentage({
      startOfRange: accelerateAt,
      endOfRange: endOfRange,
      current: runTime
    });
    var scroll = proposedScroll * config.ease(betweenAccelerateAtAndStopAtPercentage);
    return Math.ceil(scroll);
  });

  var getValue = (function (_ref) {
    var distanceToEdge = _ref.distanceToEdge,
      thresholds = _ref.thresholds,
      dragStartTime = _ref.dragStartTime,
      shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = getValueFromDistance(distanceToEdge, thresholds);

    if (scroll === 0) {
      return 0;
    }

    if (!shouldUseTimeDampening) {
      return scroll;
    }

    return Math.max(dampenValueByTime(scroll, dragStartTime), minScroll);
  });

  var getScrollOnAxis = (function (_ref) {
    var container = _ref.container,
      distanceToEdges = _ref.distanceToEdges,
      dragStartTime = _ref.dragStartTime,
      axis = _ref.axis,
      shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var thresholds = getDistanceThresholds(container, axis);
    var isCloserToEnd = distanceToEdges[axis.end] < distanceToEdges[axis.start];

    if (isCloserToEnd) {
      return getValue({
        distanceToEdge: distanceToEdges[axis.end],
        thresholds: thresholds,
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: shouldUseTimeDampening
      });
    }

    return -1 * getValue({
      distanceToEdge: distanceToEdges[axis.start],
      thresholds: thresholds,
      dragStartTime: dragStartTime,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
  });

  var adjustForSizeLimits = (function (_ref) {
    var container = _ref.container,
      subject = _ref.subject,
      proposedScroll = _ref.proposedScroll;
    var isTooBigVertically = subject.height > container.height;
    var isTooBigHorizontally = subject.width > container.width;

    if (!isTooBigHorizontally && !isTooBigVertically) {
      return proposedScroll;
    }

    if (isTooBigHorizontally && isTooBigVertically) {
      return null;
    }

    return {
      x: isTooBigHorizontally ? 0 : proposedScroll.x,
      y: isTooBigVertically ? 0 : proposedScroll.y
    };
  });

  var clean$3 = apply(function (value) {
    return value === 0 ? 0 : value;
  });
  var getScroll = (function (_ref) {
    var dragStartTime = _ref.dragStartTime,
      container = _ref.container,
      subject = _ref.subject,
      center = _ref.center,
      shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var distanceToEdges = {
      top: center.y - container.top,
      right: container.right - center.x,
      bottom: container.bottom - center.y,
      left: center.x - container.left
    };
    var y = getScrollOnAxis({
      container: container,
      distanceToEdges: distanceToEdges,
      dragStartTime: dragStartTime,
      axis: vertical,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    var x = getScrollOnAxis({
      container: container,
      distanceToEdges: distanceToEdges,
      dragStartTime: dragStartTime,
      axis: horizontal,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    var required = clean$3({
      x: x,
      y: y
    });

    if (isEqual(required, origin)) {
      return null;
    }

    var limited = adjustForSizeLimits({
      container: container,
      subject: subject,
      proposedScroll: required
    });

    if (!limited) {
      return null;
    }

    return isEqual(limited, origin) ? null : limited;
  });

  var smallestSigned = apply(function (value) {
    if (value === 0) {
      return 0;
    }

    return value > 0 ? 1 : -1;
  });
  var getOverlap = function () {
    var getRemainder = function getRemainder(target, max) {
      if (target < 0) {
        return target;
      }

      if (target > max) {
        return target - max;
      }

      return 0;
    };

    return function (_ref) {
      var current = _ref.current,
        max = _ref.max,
        change = _ref.change;
      var targetScroll = add(current, change);
      var overlap = {
        x: getRemainder(targetScroll.x, max.x),
        y: getRemainder(targetScroll.y, max.y)
      };

      if (isEqual(overlap, origin)) {
        return null;
      }

      return overlap;
    };
  }();
  var canPartiallyScroll = function canPartiallyScroll(_ref2) {
    var rawMax = _ref2.max,
      current = _ref2.current,
      change = _ref2.change;
    var max = {
      x: Math.max(current.x, rawMax.x),
      y: Math.max(current.y, rawMax.y)
    };
    var smallestChange = smallestSigned(change);
    var overlap = getOverlap({
      max: max,
      current: current,
      change: smallestChange
    });

    if (!overlap) {
      return true;
    }

    if (smallestChange.x !== 0 && overlap.x === 0) {
      return true;
    }

    if (smallestChange.y !== 0 && overlap.y === 0) {
      return true;
    }

    return false;
  };
  var canScrollWindow = function canScrollWindow(viewport, change) {
    return canPartiallyScroll({
      current: viewport.scroll.current,
      max: viewport.scroll.max,
      change: change
    });
  };
  var getWindowOverlap = function getWindowOverlap(viewport, change) {
    if (!canScrollWindow(viewport, change)) {
      return null;
    }

    var max = viewport.scroll.max;
    var current = viewport.scroll.current;
    return getOverlap({
      current: current,
      max: max,
      change: change
    });
  };
  var canScrollDroppable = function canScrollDroppable(droppable, change) {
    var frame = droppable.frame;

    if (!frame) {
      return false;
    }

    return canPartiallyScroll({
      current: frame.scroll.current,
      max: frame.scroll.max,
      change: change
    });
  };
  var getDroppableOverlap = function getDroppableOverlap(droppable, change) {
    var frame = droppable.frame;

    if (!frame) {
      return null;
    }

    if (!canScrollDroppable(droppable, change)) {
      return null;
    }

    return getOverlap({
      current: frame.scroll.current,
      max: frame.scroll.max,
      change: change
    });
  };

  var getWindowScrollChange = (function (_ref) {
    var viewport = _ref.viewport,
      subject = _ref.subject,
      center = _ref.center,
      dragStartTime = _ref.dragStartTime,
      shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var scroll = getScroll({
      dragStartTime: dragStartTime,
      container: viewport.frame,
      subject: subject,
      center: center,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    return scroll && canScrollWindow(viewport, scroll) ? scroll : null;
  });

  var getDroppableScrollChange = (function (_ref) {
    var droppable = _ref.droppable,
      subject = _ref.subject,
      center = _ref.center,
      dragStartTime = _ref.dragStartTime,
      shouldUseTimeDampening = _ref.shouldUseTimeDampening;
    var frame = droppable.frame;

    if (!frame) {
      return null;
    }

    var scroll = getScroll({
      dragStartTime: dragStartTime,
      container: frame.pageMarginBox,
      subject: subject,
      center: center,
      shouldUseTimeDampening: shouldUseTimeDampening
    });
    return scroll && canScrollDroppable(droppable, scroll) ? scroll : null;
  });

  var scroll$1 = (function (_ref) {
    var state = _ref.state,
      dragStartTime = _ref.dragStartTime,
      shouldUseTimeDampening = _ref.shouldUseTimeDampening,
      scrollWindow = _ref.scrollWindow,
      scrollDroppable = _ref.scrollDroppable;
    var center = state.current.page.borderBoxCenter;
    var draggable = state.dimensions.draggables[state.critical.draggable.id];
    var subject = draggable.page.marginBox;

    if (state.isWindowScrollAllowed) {
      var viewport = state.viewport;

      var _change = getWindowScrollChange({
        dragStartTime: dragStartTime,
        viewport: viewport,
        subject: subject,
        center: center,
        shouldUseTimeDampening: shouldUseTimeDampening
      });

      if (_change) {
        scrollWindow(_change);
        return;
      }
    }

    var droppable = getBestScrollableDroppable({
      center: center,
      destination: whatIsDraggedOver(state.impact),
      droppables: state.dimensions.droppables
    });

    if (!droppable) {
      return;
    }

    var change = getDroppableScrollChange({
      dragStartTime: dragStartTime,
      droppable: droppable,
      subject: subject,
      center: center,
      shouldUseTimeDampening: shouldUseTimeDampening
    });

    if (change) {
      scrollDroppable(droppable.descriptor.id, change);
    }
  });

  var createFluidScroller = (function (_ref) {
    var scrollWindow = _ref.scrollWindow,
      scrollDroppable = _ref.scrollDroppable;
    var scheduleWindowScroll = index$1(scrollWindow);
    var scheduleDroppableScroll = index$1(scrollDroppable);
    var dragging = null;

    var tryScroll = function tryScroll(state) {
      !dragging ? invariant(false, 'Cannot fluid scroll if not dragging') : void 0;
      var _dragging = dragging,
        shouldUseTimeDampening = _dragging.shouldUseTimeDampening,
        dragStartTime = _dragging.dragStartTime;
      scroll$1({
        state: state,
        scrollWindow: scheduleWindowScroll,
        scrollDroppable: scheduleDroppableScroll,
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: shouldUseTimeDampening
      });
    };

    var cancelPending = function cancelPending() {
      !dragging ? invariant(false, 'Cannot cancel pending fluid scroll when not started') : void 0;
      scheduleWindowScroll.cancel();
      scheduleDroppableScroll.cancel();
    };

    var start$$1 = function start$$1(state) {
      start('starting fluid scroller');
      !!dragging ? invariant(false, 'Cannot start auto scrolling when already started') : void 0;

      var dragStartTime = now$1();

      var wasScrollNeeded = false;

      var fakeScrollCallback = function fakeScrollCallback() {
        wasScrollNeeded = true;
      };

      scroll$1({
        state: state,
        dragStartTime: 0,
        shouldUseTimeDampening: false,
        scrollWindow: fakeScrollCallback,
        scrollDroppable: fakeScrollCallback
      });
      dragging = {
        dragStartTime: dragStartTime,
        shouldUseTimeDampening: wasScrollNeeded
      };
      finish('starting fluid scroller');

      if (wasScrollNeeded) {
        tryScroll(state);
      }
    };

    var stop = function stop() {
      if (!dragging) {
        return;
      }

      cancelPending();
      dragging = null;
    };

    return {
      start: start$$1,
      stop: stop,
      cancelPending: cancelPending,
      scroll: tryScroll
    };
  });

  var createJumpScroller = (function (_ref) {
    var move = _ref.move,
      scrollDroppable = _ref.scrollDroppable,
      scrollWindow = _ref.scrollWindow;

    var moveByOffset = function moveByOffset(state, offset) {
      var client = add(state.current.client.selection, offset);
      move({
        client: client
      });
    };

    var scrollDroppableAsMuchAsItCan = function scrollDroppableAsMuchAsItCan(droppable, change) {
      if (!canScrollDroppable(droppable, change)) {
        return change;
      }

      var overlap = getDroppableOverlap(droppable, change);

      if (!overlap) {
        scrollDroppable(droppable.descriptor.id, change);
        return null;
      }

      var whatTheDroppableCanScroll = subtract(change, overlap);
      scrollDroppable(droppable.descriptor.id, whatTheDroppableCanScroll);
      var remainder = subtract(change, whatTheDroppableCanScroll);
      return remainder;
    };

    var scrollWindowAsMuchAsItCan = function scrollWindowAsMuchAsItCan(isWindowScrollAllowed, viewport, change) {
      if (!isWindowScrollAllowed) {
        return change;
      }

      if (!canScrollWindow(viewport, change)) {
        return change;
      }

      var overlap = getWindowOverlap(viewport, change);

      if (!overlap) {
        scrollWindow(change);
        return null;
      }

      var whatTheWindowCanScroll = subtract(change, overlap);
      scrollWindow(whatTheWindowCanScroll);
      var remainder = subtract(change, whatTheWindowCanScroll);
      return remainder;
    };

    var jumpScroller = function jumpScroller(state) {
      var request = state.scrollJumpRequest;

      if (!request) {
        return;
      }

      var destination = whatIsDraggedOver(state.impact);
      !destination ? invariant(false, 'Cannot perform a jump scroll when there is no destination') : void 0;
      var droppableRemainder = scrollDroppableAsMuchAsItCan(state.dimensions.droppables[destination], request);

      if (!droppableRemainder) {
        return;
      }

      var viewport = state.viewport;
      var windowRemainder = scrollWindowAsMuchAsItCan(state.isWindowScrollAllowed, viewport, droppableRemainder);

      if (!windowRemainder) {
        return;
      }

      moveByOffset(state, windowRemainder);
    };

    return jumpScroller;
  });

  var createAutoScroller = (function (_ref) {
    var scrollDroppable = _ref.scrollDroppable,
      scrollWindow = _ref.scrollWindow,
      move = _ref.move;
    var fluidScroller = createFluidScroller({
      scrollWindow: scrollWindow,
      scrollDroppable: scrollDroppable
    });
    var jumpScroll = createJumpScroller({
      move: move,
      scrollWindow: scrollWindow,
      scrollDroppable: scrollDroppable
    });

    var scroll = function scroll(state) {
      if (state.phase !== 'DRAGGING') {
        return;
      }

      if (state.movementMode === 'FLUID') {
        fluidScroller.scroll(state);
        return;
      }

      if (!state.scrollJumpRequest) {
        return;
      }

      jumpScroll(state);
    };

    var scroller = {
      scroll: scroll,
      cancelPending: fluidScroller.cancelPending,
      start: fluidScroller.start,
      stop: fluidScroller.stop
    };
    return scroller;
  });

  var prefix$2 = function prefix(key) {
    return "private-react-beautiful-dnd-key-do-not-use-" + key;
  };

  var storeKey = prefix$2('store');
  var droppableIdKey = prefix$2('droppable-id');
  var droppableTypeKey = prefix$2('droppable-type');
  var dimensionMarshalKey = prefix$2('dimension-marshal');
  var styleContextKey = prefix$2('style-context');
  var canLiftContextKey = prefix$2('can-lift');

  var peerDependencies = {
    react: "^16.3.1"
  };

  var semver = /(\d+)\.(\d+)\.(\d+)/;

  var getVersion = function getVersion(value) {
    var result = semver.exec(value);
    !(result != null) ? invariant(false, "Unable to parse React version " + value) : void 0;
    var major = Number(result[1]);
    var minor = Number(result[2]);
    var patch = Number(result[3]);
    return {
      major: major,
      minor: minor,
      patch: patch,
      raw: value
    };
  };

  var isSatisfied = function isSatisfied(expected, actual) {
    if (actual.major > expected.major) {
      return true;
    }

    if (actual.major < expected.major) {
      return false;
    }

    if (actual.minor > expected.minor) {
      return true;
    }

    if (actual.minor < expected.minor) {
      return false;
    }

    return actual.patch >= expected.patch;
  };

  var checkReactVersion = (function (peerDepValue, actualValue) {
    var peerDep = getVersion(peerDepValue);
    var actual = getVersion(actualValue);

    if (isSatisfied(peerDep, actual)) {
      return;
    }

    warning$3("\n    React version: [" + actual.raw + "]\n    does not satisfy expected peer dependency version: [" + peerDep.raw + "]\n\n    This can result in run time bugs, and even fatal crashes\n  ");
  });

  var suffix = "\n  We expect a html5 doctype: <!doctype html>\n  This is to ensure consistent browser layout and measurement\n\n  More information: https://github.com/atlassian/react-beautiful-dnd#use-the-html5-doctype\n";
  var checkDoctype = (function (doc) {
    var doctype = doc.doctype;

    if (!doctype) {
      warning$3("\n      No <!doctype html> found.\n\n      " + suffix + "\n    ");
      return;
    }

    if (doctype.name.toLowerCase() !== 'html') {
      warning$3("\n      Unexpected <!doctype> found: (" + doctype.name + ")\n\n      " + suffix + "\n    ");
    }

    if (doctype.publicId !== '') {
      warning$3("\n      Unexpected <!doctype> publicId found: (" + doctype.publicId + ")\n      A html5 doctype does not have a publicId\n\n      " + suffix + "\n    ");
    }
  });

  var _DragDropContext$chil;
  var resetServerContext = function resetServerContext() {
    resetStyleContext();
  };

  var printFatalDevError = function printFatalDevError(error) {
    var _console;

    (_console = console).error.apply(_console, getFormattedMessage("\n      An error has occurred while a drag is occurring.\n      Any existing drag will be cancelled.\n\n      > " + error.message + "\n      "));

    console.error('raw', error);
  };

  var DragDropContext = function (_React$Component) {
    _inheritsLoose(DragDropContext, _React$Component);

    function DragDropContext(props, context) {
      var _this;

      _this = _React$Component.call(this, props, context) || this;
      _this.store = void 0;
      _this.dimensionMarshal = void 0;
      _this.styleMarshal = void 0;
      _this.autoScroller = void 0;
      _this.announcer = void 0;
      _this.unsubscribe = void 0;

      _this.canLift = function (id) {
        return canStartDrag(_this.store.getState(), id);
      };

      _this.onFatalError = function (error) {
        printFatalDevError(error);

        var state = _this.store.getState();

        if (state.phase !== 'IDLE') {
          _this.store.dispatch(clean());
        }
      };

      _this.onWindowError = function (error) {
        return _this.onFatalError(error);
      };

      {
        !(typeof props.onDragEnd === 'function') ? invariant(false, 'A DragDropContext requires an onDragEnd function to perform reordering logic') : void 0;
      }

      _this.announcer = createAnnouncer();
      _this.styleMarshal = createStyleMarshal();
      _this.store = createStore$1({
        getDimensionMarshal: function getDimensionMarshal() {
          return _this.dimensionMarshal;
        },
        styleMarshal: _this.styleMarshal,
        getResponders: function getResponders() {
          return {
            onBeforeDragStart: _this.props.onBeforeDragStart,
            onDragStart: _this.props.onDragStart,
            onDragEnd: _this.props.onDragEnd,
            onDragUpdate: _this.props.onDragUpdate
          };
        },
        announce: _this.announcer.announce,
        getScroller: function getScroller() {
          return _this.autoScroller;
        }
      });
      var callbacks = bindActionCreators({
        publishWhileDragging: publishWhileDragging$1,
        updateDroppableScroll: updateDroppableScroll,
        updateDroppableIsEnabled: updateDroppableIsEnabled,
        updateDroppableIsCombineEnabled: updateDroppableIsCombineEnabled,
        collectionStarting: collectionStarting
      }, _this.store.dispatch);
      _this.dimensionMarshal = createDimensionMarshal(callbacks);
      _this.autoScroller = createAutoScroller(_extends({
        scrollWindow: scrollWindow,
        scrollDroppable: _this.dimensionMarshal.scrollDroppable
      }, bindActionCreators({
        move: move
      }, _this.store.dispatch)));
      return _this;
    }

    var _proto = DragDropContext.prototype;

    _proto.getChildContext = function getChildContext() {
      var _ref;

      return _ref = {}, _ref[storeKey] = this.store, _ref[dimensionMarshalKey] = this.dimensionMarshal, _ref[styleContextKey] = this.styleMarshal.styleContext, _ref[canLiftContextKey] = this.canLift, _ref;
    };

    _proto.componentDidMount = function componentDidMount() {
      window.addEventListener('error', this.onWindowError);
      this.styleMarshal.mount();
      this.announcer.mount();

      {
        checkReactVersion(peerDependencies.react, React__default.version);
        checkDoctype(document);
      }
    };

    _proto.componentDidCatch = function componentDidCatch(error) {
      this.onFatalError(error);

      if (error.message.indexOf('Invariant failed') !== -1) {
        this.setState({});
        return;
      }

      throw error;
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      window.removeEventListener('error', this.onWindowError);
      var state = this.store.getState();

      if (state.phase !== 'IDLE') {
        this.store.dispatch(clean());
      }

      this.styleMarshal.unmount();
      this.announcer.unmount();
    };

    _proto.render = function render() {
      return this.props.children;
    };

    return DragDropContext;
  }(React__default.Component);

  DragDropContext.childContextTypes = (_DragDropContext$chil = {}, _DragDropContext$chil[storeKey] = propTypes.shape({
    dispatch: propTypes.func.isRequired,
    subscribe: propTypes.func.isRequired,
    getState: propTypes.func.isRequired
  }).isRequired, _DragDropContext$chil[dimensionMarshalKey] = propTypes.object.isRequired, _DragDropContext$chil[styleContextKey] = propTypes.string.isRequired, _DragDropContext$chil[canLiftContextKey] = propTypes.func.isRequired, _DragDropContext$chil);

  function _inheritsLoose$1(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  var subscriptionShape = propTypes.shape({
    trySubscribe: propTypes.func.isRequired,
    tryUnsubscribe: propTypes.func.isRequired,
    notifyNestedSubs: propTypes.func.isRequired,
    isSubscribed: propTypes.func.isRequired
  });
  var storeShape = propTypes.shape({
    subscribe: propTypes.func.isRequired,
    dispatch: propTypes.func.isRequired,
    getState: propTypes.func.isRequired
  });

  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */
  function warning$4(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */


    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
      /* eslint-disable no-empty */
    } catch (e) {}
    /* eslint-enable no-empty */

  }

  var didWarnAboutReceivingStore = false;

  function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
      return;
    }

    didWarnAboutReceivingStore = true;
    warning$4('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/reduxjs/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
  }

  function createProvider(storeKey) {
    var _Provider$childContex;

    if (storeKey === void 0) {
      storeKey = 'store';
    }

    var subscriptionKey = storeKey + "Subscription";

    var Provider =
      /*#__PURE__*/
      function (_Component) {
        _inheritsLoose$1(Provider, _Component);

        var _proto = Provider.prototype;

        _proto.getChildContext = function getChildContext() {
          var _ref;

          return _ref = {}, _ref[storeKey] = this[storeKey], _ref[subscriptionKey] = null, _ref;
        };

        function Provider(props, context) {
          var _this;

          _this = _Component.call(this, props, context) || this;
          _this[storeKey] = props.store;
          return _this;
        }

        _proto.render = function render() {
          return React.Children.only(this.props.children);
        };

        return Provider;
      }(React.Component);

    {
      Provider.prototype.componentWillReceiveProps = function (nextProps) {
        if (this[storeKey] !== nextProps.store) {
          warnAboutReceivingStore();
        }
      };
    }

    Provider.propTypes = {
      store: storeShape.isRequired,
      children: propTypes.element.isRequired
    };
    Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[storeKey] = storeShape.isRequired, _Provider$childContex[subscriptionKey] = subscriptionShape, _Provider$childContex);
    return Provider;
  }
  createProvider();

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _extends$1() {
    _extends$1 = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends$1.apply(this, arguments);
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  var reactIs_production_min = createCommonjsModule(function (module, exports) {
    Object.defineProperty(exports,"__esModule",{value:!0});
    var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.concurrent_mode"):60111,m=b?Symbol.for("react.forward_ref"):60112,n=b?Symbol.for("react.suspense"):60113,q=b?Symbol.for("react.memo"):60115,r=b?Symbol.for("react.lazy"):
      60116;function t(a){if("object"===typeof a&&null!==a){var p=a.$$typeof;switch(p){case c:switch(a=a.type,a){case l:case e:case g:case f:return a;default:switch(a=a&&a.$$typeof,a){case k:case m:case h:return a;default:return p}}case d:return p}}}function u(a){return t(a)===l}exports.typeOf=t;exports.AsyncMode=l;exports.ConcurrentMode=l;exports.ContextConsumer=k;exports.ContextProvider=h;exports.Element=c;exports.ForwardRef=m;exports.Fragment=e;exports.Profiler=g;exports.Portal=d;
    exports.StrictMode=f;exports.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===l||a===g||a===f||a===n||"object"===typeof a&&null!==a&&(a.$$typeof===r||a.$$typeof===q||a.$$typeof===h||a.$$typeof===k||a.$$typeof===m)};exports.isAsyncMode=function(a){return u(a)};exports.isConcurrentMode=u;exports.isContextConsumer=function(a){return t(a)===k};exports.isContextProvider=function(a){return t(a)===h};
    exports.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};exports.isForwardRef=function(a){return t(a)===m};exports.isFragment=function(a){return t(a)===e};exports.isProfiler=function(a){return t(a)===g};exports.isPortal=function(a){return t(a)===d};exports.isStrictMode=function(a){return t(a)===f};
  });

  unwrapExports(reactIs_production_min);
  var reactIs_production_min_1 = reactIs_production_min.typeOf;
  var reactIs_production_min_2 = reactIs_production_min.AsyncMode;
  var reactIs_production_min_3 = reactIs_production_min.ConcurrentMode;
  var reactIs_production_min_4 = reactIs_production_min.ContextConsumer;
  var reactIs_production_min_5 = reactIs_production_min.ContextProvider;
  var reactIs_production_min_6 = reactIs_production_min.Element;
  var reactIs_production_min_7 = reactIs_production_min.ForwardRef;
  var reactIs_production_min_8 = reactIs_production_min.Fragment;
  var reactIs_production_min_9 = reactIs_production_min.Profiler;
  var reactIs_production_min_10 = reactIs_production_min.Portal;
  var reactIs_production_min_11 = reactIs_production_min.StrictMode;
  var reactIs_production_min_12 = reactIs_production_min.isValidElementType;
  var reactIs_production_min_13 = reactIs_production_min.isAsyncMode;
  var reactIs_production_min_14 = reactIs_production_min.isConcurrentMode;
  var reactIs_production_min_15 = reactIs_production_min.isContextConsumer;
  var reactIs_production_min_16 = reactIs_production_min.isContextProvider;
  var reactIs_production_min_17 = reactIs_production_min.isElement;
  var reactIs_production_min_18 = reactIs_production_min.isForwardRef;
  var reactIs_production_min_19 = reactIs_production_min.isFragment;
  var reactIs_production_min_20 = reactIs_production_min.isProfiler;
  var reactIs_production_min_21 = reactIs_production_min.isPortal;
  var reactIs_production_min_22 = reactIs_production_min.isStrictMode;

  var reactIs_development = createCommonjsModule(function (module, exports) {



    {
      (function() {

        Object.defineProperty(exports, '__esModule', { value: true });

        // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
        // nor polyfill, then a plain number is used for performance.
        var hasSymbol = typeof Symbol === 'function' && Symbol.for;

        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
        var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;

        function isValidElementType(type) {
          return typeof type === 'string' || typeof type === 'function' ||
            // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
            type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
        }

        /**
         * Forked from fbjs/warning:
         * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
         *
         * Only change is we use console.warn instead of console.error,
         * and do nothing when 'console' is not supported.
         * This really simplifies the code.
         * ---
         * Similar to invariant but only logs a warning if the condition is not met.
         * This can be used to log issues in development environments in critical
         * paths. Removing the logging code for production environments will keep the
         * same logic and follow the same code paths.
         */

        var lowPriorityWarning = function () {};

        {
          var printWarning = function (format) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
              args[_key - 1] = arguments[_key];
            }

            var argIndex = 0;
            var message = 'Warning: ' + format.replace(/%s/g, function () {
              return args[argIndex++];
            });
            if (typeof console !== 'undefined') {
              console.warn(message);
            }
            try {
              // --- Welcome to debugging React ---
              // This error was thrown as a convenience so that you can use this stack
              // to find the callsite that caused this warning to fire.
              throw new Error(message);
            } catch (x) {}
          };

          lowPriorityWarning = function (condition, format) {
            if (format === undefined) {
              throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument');
            }
            if (!condition) {
              for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                args[_key2 - 2] = arguments[_key2];
              }

              printWarning.apply(undefined, [format].concat(args));
            }
          };
        }

        var lowPriorityWarning$1 = lowPriorityWarning;

        function typeOf(object) {
          if (typeof object === 'object' && object !== null) {
            var $$typeof = object.$$typeof;

            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;

                switch (type) {
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;

                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }

          return undefined;
        }

        // AsyncMode alias is deprecated along with isAsyncMode
        var AsyncMode = REACT_CONCURRENT_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment = REACT_FRAGMENT_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var Portal = REACT_PORTAL_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;

        var hasWarnedAboutDeprecatedIsAsyncMode = false;

        // AsyncMode should be deprecated
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              lowPriorityWarning$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
            }
          }
          return isConcurrentMode(object);
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement(object) {
          return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }

        exports.typeOf = typeOf;
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment;
        exports.Profiler = Profiler;
        exports.Portal = Portal;
        exports.StrictMode = StrictMode;
        exports.isValidElementType = isValidElementType;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isProfiler = isProfiler;
        exports.isPortal = isPortal;
        exports.isStrictMode = isStrictMode;
      })();
    }
  });

  unwrapExports(reactIs_development);
  var reactIs_development_1 = reactIs_development.typeOf;
  var reactIs_development_2 = reactIs_development.AsyncMode;
  var reactIs_development_3 = reactIs_development.ConcurrentMode;
  var reactIs_development_4 = reactIs_development.ContextConsumer;
  var reactIs_development_5 = reactIs_development.ContextProvider;
  var reactIs_development_6 = reactIs_development.Element;
  var reactIs_development_7 = reactIs_development.ForwardRef;
  var reactIs_development_8 = reactIs_development.Fragment;
  var reactIs_development_9 = reactIs_development.Profiler;
  var reactIs_development_10 = reactIs_development.Portal;
  var reactIs_development_11 = reactIs_development.StrictMode;
  var reactIs_development_12 = reactIs_development.isValidElementType;
  var reactIs_development_13 = reactIs_development.isAsyncMode;
  var reactIs_development_14 = reactIs_development.isConcurrentMode;
  var reactIs_development_15 = reactIs_development.isContextConsumer;
  var reactIs_development_16 = reactIs_development.isContextProvider;
  var reactIs_development_17 = reactIs_development.isElement;
  var reactIs_development_18 = reactIs_development.isForwardRef;
  var reactIs_development_19 = reactIs_development.isFragment;
  var reactIs_development_20 = reactIs_development.isProfiler;
  var reactIs_development_21 = reactIs_development.isPortal;
  var reactIs_development_22 = reactIs_development.isStrictMode;

  var reactIs = createCommonjsModule(function (module) {

    {
      module.exports = reactIs_development;
    }
  });
  var reactIs_1 = reactIs.isValidElementType;

  /**
   * Copyright 2015, Yahoo! Inc.
   * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
   */


  var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };

  var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
  };

  var FORWARD_REF_STATICS = {
    '$$typeof': true,
    render: true
  };

  var TYPE_STATICS = {};
  TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;

  var defineProperty = Object.defineProperty;
  var getOwnPropertyNames = Object.getOwnPropertyNames;
  var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var getPrototypeOf = Object.getPrototypeOf;
  var objectPrototype = Object.prototype;

  function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') {
      // don't hoist over string (html) components

      if (objectPrototype) {
        var inheritedComponent = getPrototypeOf(sourceComponent);
        if (inheritedComponent && inheritedComponent !== objectPrototype) {
          hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
        }
      }

      var keys = getOwnPropertyNames(sourceComponent);

      if (getOwnPropertySymbols$1) {
        keys = keys.concat(getOwnPropertySymbols$1(sourceComponent));
      }

      var targetStatics = TYPE_STATICS[targetComponent['$$typeof']] || REACT_STATICS;
      var sourceStatics = TYPE_STATICS[sourceComponent['$$typeof']] || REACT_STATICS;

      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
          var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
          try {
            // Avoid failures from read-only properties
            defineProperty(targetComponent, key, descriptor);
          } catch (e) {}
        }
      }

      return targetComponent;
    }

    return targetComponent;
  }

  var hoistNonReactStatics_cjs = hoistNonReactStatics;

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var invariant$3 = function(condition, format, a, b, c, d, e, f) {
    {
      if (format === undefined) {
        throw new Error('invariant requires an error message argument');
      }
    }

    if (!condition) {
      var error;
      if (format === undefined) {
        error = new Error(
          'Minified exception occurred; use the non-minified dev environment ' +
          'for the full error message and additional helpful warnings.'
        );
      } else {
        var args = [a, b, c, d, e, f];
        var argIndex = 0;
        error = new Error(
          format.replace(/%s/g, function() { return args[argIndex++]; })
        );
        error.name = 'Invariant Violation';
      }

      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    }
  };

  var invariant_1$1 = invariant$3;

  // encapsulates the subscription logic for connecting a component to the redux store, as
  // well as nesting subscriptions of descendant components, so that we can ensure the
  // ancestor components re-render before descendants
  var CLEARED = null;
  var nullListeners = {
    notify: function notify() {}
  };

  function createListenerCollection() {
    // the current/next pattern is copied from redux's createStore code.
    // TODO: refactor+expose that code to be reusable here?
    var current = [];
    var next = [];
    return {
      clear: function clear() {
        next = CLEARED;
        current = CLEARED;
      },
      notify: function notify() {
        var listeners = current = next;

        for (var i = 0; i < listeners.length; i++) {
          listeners[i]();
        }
      },
      get: function get() {
        return next;
      },
      subscribe: function subscribe(listener) {
        var isSubscribed = true;
        if (next === current) next = current.slice();
        next.push(listener);
        return function unsubscribe() {
          if (!isSubscribed || current === CLEARED) return;
          isSubscribed = false;
          if (next === current) next = current.slice();
          next.splice(next.indexOf(listener), 1);
        };
      }
    };
  }

  var Subscription =
    /*#__PURE__*/
    function () {
      function Subscription(store, parentSub, onStateChange) {
        this.store = store;
        this.parentSub = parentSub;
        this.onStateChange = onStateChange;
        this.unsubscribe = null;
        this.listeners = nullListeners;
      }

      var _proto = Subscription.prototype;

      _proto.addNestedSub = function addNestedSub(listener) {
        this.trySubscribe();
        return this.listeners.subscribe(listener);
      };

      _proto.notifyNestedSubs = function notifyNestedSubs() {
        this.listeners.notify();
      };

      _proto.isSubscribed = function isSubscribed() {
        return Boolean(this.unsubscribe);
      };

      _proto.trySubscribe = function trySubscribe() {
        if (!this.unsubscribe) {
          this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.onStateChange) : this.store.subscribe(this.onStateChange);
          this.listeners = createListenerCollection();
        }
      };

      _proto.tryUnsubscribe = function tryUnsubscribe() {
        if (this.unsubscribe) {
          this.unsubscribe();
          this.unsubscribe = null;
          this.listeners.clear();
          this.listeners = nullListeners;
        }
      };

      return Subscription;
    }();

  var hotReloadingVersion = 0;
  var dummyState = {};

  function noop() {}

  function makeSelectorStateful(sourceSelector, store) {
    // wrap the selector in an object that tracks its results between runs.
    var selector = {
      run: function runComponentSelector(props) {
        try {
          var nextProps = sourceSelector(store.getState(), props);

          if (nextProps !== selector.props || selector.error) {
            selector.shouldComponentUpdate = true;
            selector.props = nextProps;
            selector.error = null;
          }
        } catch (error) {
          selector.shouldComponentUpdate = true;
          selector.error = error;
        }
      }
    };
    return selector;
  }

  function connectAdvanced(
    /*
	  selectorFactory is a func that is responsible for returning the selector function used to
	  compute new props from state, props, and dispatch. For example:
	     export default connectAdvanced((dispatch, options) => (state, props) => ({
	      thing: state.things[props.thingId],
	      saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
	    }))(YourComponent)
	   Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
	  outside of their selector as an optimization. Options passed to connectAdvanced are passed to
	  the selectorFactory, along with displayName and WrappedComponent, as the second argument.
	   Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
	  props. Do not use connectAdvanced directly without memoizing results between calls to your
	  selector, otherwise the Connect component will re-render on every state or props change.
	*/
    selectorFactory, // options object:
    _ref) {
    var _contextTypes, _childContextTypes;

    if (_ref === void 0) {
      _ref = {};
    }

    var _ref2 = _ref,
      _ref2$getDisplayName = _ref2.getDisplayName,
      getDisplayName = _ref2$getDisplayName === void 0 ? function (name) {
        return "ConnectAdvanced(" + name + ")";
      } : _ref2$getDisplayName,
      _ref2$methodName = _ref2.methodName,
      methodName = _ref2$methodName === void 0 ? 'connectAdvanced' : _ref2$methodName,
      _ref2$renderCountProp = _ref2.renderCountProp,
      renderCountProp = _ref2$renderCountProp === void 0 ? undefined : _ref2$renderCountProp,
      _ref2$shouldHandleSta = _ref2.shouldHandleStateChanges,
      shouldHandleStateChanges = _ref2$shouldHandleSta === void 0 ? true : _ref2$shouldHandleSta,
      _ref2$storeKey = _ref2.storeKey,
      storeKey = _ref2$storeKey === void 0 ? 'store' : _ref2$storeKey,
      _ref2$withRef = _ref2.withRef,
      withRef = _ref2$withRef === void 0 ? false : _ref2$withRef,
      connectOptions = _objectWithoutPropertiesLoose(_ref2, ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef"]);

    var subscriptionKey = storeKey + 'Subscription';
    var version = hotReloadingVersion++;
    var contextTypes = (_contextTypes = {}, _contextTypes[storeKey] = storeShape, _contextTypes[subscriptionKey] = subscriptionShape, _contextTypes);
    var childContextTypes = (_childContextTypes = {}, _childContextTypes[subscriptionKey] = subscriptionShape, _childContextTypes);
    return function wrapWithConnect(WrappedComponent) {
      invariant_1$1(reactIs_1(WrappedComponent), "You must pass a component to the function returned by " + (methodName + ". Instead received " + JSON.stringify(WrappedComponent)));
      var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
      var displayName = getDisplayName(wrappedComponentName);

      var selectorFactoryOptions = _extends$1({}, connectOptions, {
        getDisplayName: getDisplayName,
        methodName: methodName,
        renderCountProp: renderCountProp,
        shouldHandleStateChanges: shouldHandleStateChanges,
        storeKey: storeKey,
        withRef: withRef,
        displayName: displayName,
        wrappedComponentName: wrappedComponentName,
        WrappedComponent: WrappedComponent // TODO Actually fix our use of componentWillReceiveProps

        /* eslint-disable react/no-deprecated */

      });

      var Connect =
        /*#__PURE__*/
        function (_Component) {
          _inheritsLoose$1(Connect, _Component);

          function Connect(props, context) {
            var _this;

            _this = _Component.call(this, props, context) || this;
            _this.version = version;
            _this.state = {};
            _this.renderCount = 0;
            _this.store = props[storeKey] || context[storeKey];
            _this.propsMode = Boolean(props[storeKey]);
            _this.setWrappedInstance = _this.setWrappedInstance.bind(_assertThisInitialized(_assertThisInitialized(_this)));
            invariant_1$1(_this.store, "Could not find \"" + storeKey + "\" in either the context or props of " + ("\"" + displayName + "\". Either wrap the root component in a <Provider>, ") + ("or explicitly pass \"" + storeKey + "\" as a prop to \"" + displayName + "\"."));

            _this.initSelector();

            _this.initSubscription();

            return _this;
          }

          var _proto = Connect.prototype;

          _proto.getChildContext = function getChildContext() {
            var _ref3;

            // If this component received store from props, its subscription should be transparent
            // to any descendants receiving store+subscription from context; it passes along
            // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
            // Connect to control ordering of notifications to flow top-down.
            var subscription = this.propsMode ? null : this.subscription;
            return _ref3 = {}, _ref3[subscriptionKey] = subscription || this.context[subscriptionKey], _ref3;
          };

          _proto.componentDidMount = function componentDidMount() {
            if (!shouldHandleStateChanges) return; // componentWillMount fires during server side rendering, but componentDidMount and
            // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
            // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
            // To handle the case where a child component may have triggered a state change by
            // dispatching an action in its componentWillMount, we have to re-run the select and maybe
            // re-render.

            this.subscription.trySubscribe();
            this.selector.run(this.props);
            if (this.selector.shouldComponentUpdate) this.forceUpdate();
          };

          _proto.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
            this.selector.run(nextProps);
          };

          _proto.shouldComponentUpdate = function shouldComponentUpdate() {
            return this.selector.shouldComponentUpdate;
          };

          _proto.componentWillUnmount = function componentWillUnmount() {
            if (this.subscription) this.subscription.tryUnsubscribe();
            this.subscription = null;
            this.notifyNestedSubs = noop;
            this.store = null;
            this.selector.run = noop;
            this.selector.shouldComponentUpdate = false;
          };

          _proto.getWrappedInstance = function getWrappedInstance() {
            invariant_1$1(withRef, "To access the wrapped instance, you need to specify " + ("{ withRef: true } in the options argument of the " + methodName + "() call."));
            return this.wrappedInstance;
          };

          _proto.setWrappedInstance = function setWrappedInstance(ref) {
            this.wrappedInstance = ref;
          };

          _proto.initSelector = function initSelector() {
            var sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions);
            this.selector = makeSelectorStateful(sourceSelector, this.store);
            this.selector.run(this.props);
          };

          _proto.initSubscription = function initSubscription() {
            if (!shouldHandleStateChanges) return; // parentSub's source should match where store came from: props vs. context. A component
            // connected to the store via props shouldn't use subscription from context, or vice versa.

            var parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey];
            this.subscription = new Subscription(this.store, parentSub, this.onStateChange.bind(this)); // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
            // the middle of the notification loop, where `this.subscription` will then be null. An
            // extra null check every change can be avoided by copying the method onto `this` and then
            // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
            // listeners logic is changed to not call listeners that have been unsubscribed in the
            // middle of the notification loop.

            this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription);
          };

          _proto.onStateChange = function onStateChange() {
            this.selector.run(this.props);

            if (!this.selector.shouldComponentUpdate) {
              this.notifyNestedSubs();
            } else {
              this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate;
              this.setState(dummyState);
            }
          };

          _proto.notifyNestedSubsOnComponentDidUpdate = function notifyNestedSubsOnComponentDidUpdate() {
            // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
            // needs to notify nested subs. Once called, it unimplements itself until further state
            // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
            // a boolean check every time avoids an extra method call most of the time, resulting
            // in some perf boost.
            this.componentDidUpdate = undefined;
            this.notifyNestedSubs();
          };

          _proto.isSubscribed = function isSubscribed() {
            return Boolean(this.subscription) && this.subscription.isSubscribed();
          };

          _proto.addExtraProps = function addExtraProps(props) {
            if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props; // make a shallow copy so that fields added don't leak to the original selector.
            // this is especially important for 'ref' since that's a reference back to the component
            // instance. a singleton memoized selector would then be holding a reference to the
            // instance, preventing the instance from being garbage collected, and that would be bad

            var withExtras = _extends$1({}, props);

            if (withRef) withExtras.ref = this.setWrappedInstance;
            if (renderCountProp) withExtras[renderCountProp] = this.renderCount++;
            if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription;
            return withExtras;
          };

          _proto.render = function render() {
            var selector = this.selector;
            selector.shouldComponentUpdate = false;

            if (selector.error) {
              throw selector.error;
            } else {
              return React.createElement(WrappedComponent, this.addExtraProps(selector.props));
            }
          };

          return Connect;
        }(React.Component);
      /* eslint-enable react/no-deprecated */


      Connect.WrappedComponent = WrappedComponent;
      Connect.displayName = displayName;
      Connect.childContextTypes = childContextTypes;
      Connect.contextTypes = contextTypes;
      Connect.propTypes = contextTypes;

      {
        Connect.prototype.componentWillUpdate = function componentWillUpdate() {
          var _this2 = this;

          // We are hot reloading!
          if (this.version !== version) {
            this.version = version;
            this.initSelector(); // If any connected descendants don't hot reload (and resubscribe in the process), their
            // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
            // listeners, this does mean that the old versions of connected descendants will still be
            // notified of state changes; however, their onStateChange function is a no-op so this
            // isn't a huge deal.

            var oldListeners = [];

            if (this.subscription) {
              oldListeners = this.subscription.listeners.get();
              this.subscription.tryUnsubscribe();
            }

            this.initSubscription();

            if (shouldHandleStateChanges) {
              this.subscription.trySubscribe();
              oldListeners.forEach(function (listener) {
                return _this2.subscription.listeners.subscribe(listener);
              });
            }
          }
        };
      }

      return hoistNonReactStatics_cjs(Connect, WrappedComponent);
    };
  }

  var hasOwn = Object.prototype.hasOwnProperty;

  function is$1(x, y) {
    if (x === y) {
      return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
      return x !== x && y !== y;
    }
  }

  function shallowEqual$1(objA, objB) {
    if (is$1(objA, objB)) return true;

    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
      return false;
    }

    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;

    for (var i = 0; i < keysA.length; i++) {
      if (!hasOwn.call(objB, keysA[i]) || !is$1(objA[keysA[i]], objB[keysA[i]])) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param {any} obj The object to inspect.
   * @returns {boolean} True if the argument appears to be a plain object.
   */
  function isPlainObject$1(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }

  function verifyPlainObject(value, displayName, methodName) {
    if (!isPlainObject$1(value)) {
      warning$4(methodName + "() in " + displayName + " must return a plain object. Instead received " + value + ".");
    }
  }

  function wrapMapToPropsConstant(getConstant) {
    return function initConstantSelector(dispatch, options) {
      var constant = getConstant(dispatch, options);

      function constantSelector() {
        return constant;
      }

      constantSelector.dependsOnOwnProps = false;
      return constantSelector;
    };
  } // dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
  // to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
  // whether mapToProps needs to be invoked when props have changed.
  //
  // A length of one signals that mapToProps does not depend on props from the parent component.
  // A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
  // therefore not reporting its length accurately..

  function getDependsOnOwnProps(mapToProps) {
    return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
  } // Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
  // this function wraps mapToProps in a proxy function which does several things:
  //
  //  * Detects whether the mapToProps function being called depends on props, which
  //    is used by selectorFactory to decide if it should reinvoke on props changes.
  //
  //  * On first call, handles mapToProps if returns another function, and treats that
  //    new function as the true mapToProps for subsequent calls.
  //
  //  * On first call, verifies the first result is a plain object, in order to warn
  //    the developer that their mapToProps function is not returning a valid result.
  //

  function wrapMapToPropsFunc(mapToProps, methodName) {
    return function initProxySelector(dispatch, _ref) {
      var displayName = _ref.displayName;

      var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
        return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
      }; // allow detectFactoryAndVerify to get ownProps


      proxy.dependsOnOwnProps = true;

      proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
        proxy.mapToProps = mapToProps;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
        var props = proxy(stateOrDispatch, ownProps);

        if (typeof props === 'function') {
          proxy.mapToProps = props;
          proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
          props = proxy(stateOrDispatch, ownProps);
        }

        verifyPlainObject(props, displayName, methodName);
        return props;
      };

      return proxy;
    };
  }

  function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
    return typeof mapDispatchToProps === 'function' ? wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps') : undefined;
  }
  function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
    return !mapDispatchToProps ? wrapMapToPropsConstant(function (dispatch) {
      return {
        dispatch: dispatch
      };
    }) : undefined;
  }
  function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? wrapMapToPropsConstant(function (dispatch) {
      return bindActionCreators(mapDispatchToProps, dispatch);
    }) : undefined;
  }
  var defaultMapDispatchToPropsFactories = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];

  function whenMapStateToPropsIsFunction(mapStateToProps) {
    return typeof mapStateToProps === 'function' ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps') : undefined;
  }
  function whenMapStateToPropsIsMissing(mapStateToProps) {
    return !mapStateToProps ? wrapMapToPropsConstant(function () {
      return {};
    }) : undefined;
  }
  var defaultMapStateToPropsFactories = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];

  function defaultMergeProps(stateProps, dispatchProps, ownProps) {
    return _extends$1({}, ownProps, stateProps, dispatchProps);
  }
  function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, _ref) {
      var displayName = _ref.displayName,
        pure = _ref.pure,
        areMergedPropsEqual = _ref.areMergedPropsEqual;
      var hasRunOnce = false;
      var mergedProps;
      return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
        var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

        if (hasRunOnce) {
          if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
        } else {
          hasRunOnce = true;
          mergedProps = nextMergedProps;
          verifyPlainObject(mergedProps, displayName, 'mergeProps');
        }

        return mergedProps;
      };
    };
  }
  function whenMergePropsIsFunction(mergeProps) {
    return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
  }
  function whenMergePropsIsOmitted(mergeProps) {
    return !mergeProps ? function () {
      return defaultMergeProps;
    } : undefined;
  }
  var defaultMergePropsFactories = [whenMergePropsIsFunction, whenMergePropsIsOmitted];

  function verify(selector, methodName, displayName) {
    if (!selector) {
      throw new Error("Unexpected value for " + methodName + " in " + displayName + ".");
    } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
      if (!selector.hasOwnProperty('dependsOnOwnProps')) {
        warning$4("The selector for " + methodName + " of " + displayName + " did not specify a value for dependsOnOwnProps.");
      }
    }
  }

  function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
    verify(mapStateToProps, 'mapStateToProps', displayName);
    verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
    verify(mergeProps, 'mergeProps', displayName);
  }

  function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
    return function impureFinalPropsSelector(state, ownProps) {
      return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
    };
  }
  function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
    var areStatesEqual = _ref.areStatesEqual,
      areOwnPropsEqual = _ref.areOwnPropsEqual,
      areStatePropsEqual = _ref.areStatePropsEqual;
    var hasRunAtLeastOnce = false;
    var state;
    var ownProps;
    var stateProps;
    var dispatchProps;
    var mergedProps;

    function handleFirstCall(firstState, firstOwnProps) {
      state = firstState;
      ownProps = firstOwnProps;
      stateProps = mapStateToProps(state, ownProps);
      dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      hasRunAtLeastOnce = true;
      return mergedProps;
    }

    function handleNewPropsAndNewState() {
      stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewProps() {
      if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
      if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleNewState() {
      var nextStateProps = mapStateToProps(state, ownProps);
      var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
      stateProps = nextStateProps;
      if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      return mergedProps;
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
      var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
      var stateChanged = !areStatesEqual(nextState, state);
      state = nextState;
      ownProps = nextOwnProps;
      if (propsChanged && stateChanged) return handleNewPropsAndNewState();
      if (propsChanged) return handleNewProps();
      if (stateChanged) return handleNewState();
      return mergedProps;
    }

    return function pureFinalPropsSelector(nextState, nextOwnProps) {
      return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
    };
  } // TODO: Add more comments
  // If pure is true, the selector returned by selectorFactory will memoize its results,
  // allowing connectAdvanced's shouldComponentUpdate to return false if final
  // props have not changed. If false, the selector will always return a new
  // object and shouldComponentUpdate will always return true.

  function finalPropsSelectorFactory(dispatch, _ref2) {
    var initMapStateToProps = _ref2.initMapStateToProps,
      initMapDispatchToProps = _ref2.initMapDispatchToProps,
      initMergeProps = _ref2.initMergeProps,
      options = _objectWithoutPropertiesLoose(_ref2, ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"]);

    var mapStateToProps = initMapStateToProps(dispatch, options);
    var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    var mergeProps = initMergeProps(dispatch, options);

    {
      verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
    }

    var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
    return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
  }

  /*
	  connect is a facade over connectAdvanced. It turns its args into a compatible
	  selectorFactory, which has the signature:

	    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps

	  connect passes its args to connectAdvanced as options, which will in turn pass them to
	  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

	  selectorFactory returns a final props selector from its mapStateToProps,
	  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
	  mergePropsFactories, and pure args.

	  The resulting final props selector is called by the Connect component instance whenever
	  it receives new props or store state.
	 */

  function match(arg, factories, name) {
    for (var i = factories.length - 1; i >= 0; i--) {
      var result = factories[i](arg);
      if (result) return result;
    }

    return function (dispatch, options) {
      throw new Error("Invalid value of type " + typeof arg + " for " + name + " argument when connecting component " + options.wrappedComponentName + ".");
    };
  }

  function strictEqual(a, b) {
    return a === b;
  } // createConnect with default args builds the 'official' connect behavior. Calling it with
  // different options opens up some testing and extensibility scenarios


  function createConnect(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
      _ref$connectHOC = _ref.connectHOC,
      connectHOC = _ref$connectHOC === void 0 ? connectAdvanced : _ref$connectHOC,
      _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
      mapStateToPropsFactories = _ref$mapStateToPropsF === void 0 ? defaultMapStateToPropsFactories : _ref$mapStateToPropsF,
      _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
      mapDispatchToPropsFactories = _ref$mapDispatchToPro === void 0 ? defaultMapDispatchToPropsFactories : _ref$mapDispatchToPro,
      _ref$mergePropsFactor = _ref.mergePropsFactories,
      mergePropsFactories = _ref$mergePropsFactor === void 0 ? defaultMergePropsFactories : _ref$mergePropsFactor,
      _ref$selectorFactory = _ref.selectorFactory,
      selectorFactory = _ref$selectorFactory === void 0 ? finalPropsSelectorFactory : _ref$selectorFactory;

    return function connect(mapStateToProps, mapDispatchToProps, mergeProps, _ref2) {
      if (_ref2 === void 0) {
        _ref2 = {};
      }

      var _ref3 = _ref2,
        _ref3$pure = _ref3.pure,
        pure = _ref3$pure === void 0 ? true : _ref3$pure,
        _ref3$areStatesEqual = _ref3.areStatesEqual,
        areStatesEqual = _ref3$areStatesEqual === void 0 ? strictEqual : _ref3$areStatesEqual,
        _ref3$areOwnPropsEqua = _ref3.areOwnPropsEqual,
        areOwnPropsEqual = _ref3$areOwnPropsEqua === void 0 ? shallowEqual$1 : _ref3$areOwnPropsEqua,
        _ref3$areStatePropsEq = _ref3.areStatePropsEqual,
        areStatePropsEqual = _ref3$areStatePropsEq === void 0 ? shallowEqual$1 : _ref3$areStatePropsEq,
        _ref3$areMergedPropsE = _ref3.areMergedPropsEqual,
        areMergedPropsEqual = _ref3$areMergedPropsE === void 0 ? shallowEqual$1 : _ref3$areMergedPropsE,
        extraOptions = _objectWithoutPropertiesLoose(_ref3, ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"]);

      var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
      var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
      var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
      return connectHOC(selectorFactory, _extends$1({
        // used in error messages
        methodName: 'connect',
        // used to compute Connect's displayName from the wrapped component's displayName.
        getDisplayName: function getDisplayName(name) {
          return "Connect(" + name + ")";
        },
        // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
        shouldHandleStateChanges: Boolean(mapStateToProps),
        // passed through to selectorFactory
        initMapStateToProps: initMapStateToProps,
        initMapDispatchToProps: initMapDispatchToProps,
        initMergeProps: initMergeProps,
        pure: pure,
        areStatesEqual: areStatesEqual,
        areOwnPropsEqual: areOwnPropsEqual,
        areStatePropsEqual: areStatePropsEqual,
        areMergedPropsEqual: areMergedPropsEqual
      }, extraOptions));
    };
  }
  var connect = createConnect();

  var isEqual$2 = function isEqual(base) {
    return function (value) {
      return base === value;
    };
  };

  var isScroll = isEqual$2('scroll');
  var isAuto = isEqual$2('auto');
  var isVisible$1 = isEqual$2('visible');

  var isEither = function isEither(overflow, fn) {
    return fn(overflow.overflowX) || fn(overflow.overflowY);
  };

  var isBoth = function isBoth(overflow, fn) {
    return fn(overflow.overflowX) && fn(overflow.overflowY);
  };

  var isElementScrollable = function isElementScrollable(el) {
    var style = window.getComputedStyle(el);
    var overflow = {
      overflowX: style.overflowX,
      overflowY: style.overflowY
    };
    return isEither(overflow, isScroll) || isEither(overflow, isAuto);
  };

  var isBodyScrollable = function isBodyScrollable() {

    var body = getBodyElement();
    var html = document.documentElement;
    !html ? invariant(false) : void 0;

    if (!isElementScrollable(body)) {
      return false;
    }

    var htmlStyle = window.getComputedStyle(html);
    var htmlOverflow = {
      overflowX: htmlStyle.overflowX,
      overflowY: htmlStyle.overflowY
    };

    if (isBoth(htmlOverflow, isVisible$1)) {
      return false;
    }

    warning$3("\n    We have detected that your <body> element might be a scroll container.\n    We have found no reliable way of detecting whether the <body> element is a scroll container.\n    Under most circumstances a <body> scroll bar will be on the <html> element (document.documentElement)\n\n    Because we cannot determine if the <body> is a scroll container, and generally it is not one,\n    we will be treating the <body> as *not* a scroll container\n\n    More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/how-we-detect-scroll-containers.md\n  ");
    return false;
  };

  var getClosestScrollable = function getClosestScrollable(el) {
    if (el == null) {
      return null;
    }

    if (el === document.body) {
      return isBodyScrollable() ? el : null;
    }

    if (el === document.documentElement) {
      return null;
    }

    if (!isElementScrollable(el)) {
      return getClosestScrollable(el.parentElement);
    }

    return el;
  };

  var checkForNestedScrollContainers = (function (scrollable) {
    if (!scrollable) {
      return;
    }

    var anotherScrollParent = getClosestScrollable(scrollable.parentElement);

    if (!anotherScrollParent) {
      return;
    }

    warning$3("\n    Droppable: unsupported nested scroll container detected.\n    A Droppable can only have one scroll parent (which can be itself)\n    Nested scroll containers are currently not supported.\n\n    We hope to support nested scroll containers soon: https://github.com/atlassian/react-beautiful-dnd/issues/131\n  ");
  });

  var getScroll$1 = (function (el) {
    return {
      x: el.scrollLeft,
      y: el.scrollTop
    };
  });

  var getIsFixed = function getIsFixed(el) {
    if (!el) {
      return false;
    }

    var style = window.getComputedStyle(el);

    if (style.position === 'fixed') {
      return true;
    }

    return getIsFixed(el.parentElement);
  };

  var getEnv = (function (start) {
    var closestScrollable = getClosestScrollable(start);
    var isFixedOnPage = getIsFixed(start);
    return {
      closestScrollable: closestScrollable,
      isFixedOnPage: isFixedOnPage
    };
  });

  var getClient = function getClient(targetRef, closestScrollable) {
    var base = getBox(targetRef);

    if (!closestScrollable) {
      return base;
    }

    if (targetRef !== closestScrollable) {
      return base;
    }

    var top = base.paddingBox.top - closestScrollable.scrollTop;
    var left = base.paddingBox.left - closestScrollable.scrollLeft;
    var bottom = top + closestScrollable.scrollHeight;
    var right = left + closestScrollable.scrollWidth;
    var paddingBox = {
      top: top,
      right: right,
      bottom: bottom,
      left: left
    };
    var borderBox = expand(paddingBox, base.border);
    var client = createBox({
      borderBox: borderBox,
      margin: base.margin,
      border: base.border,
      padding: base.padding
    });
    return client;
  };

  var getDimension = (function (_ref) {
    var ref = _ref.ref,
      descriptor = _ref.descriptor,
      env = _ref.env,
      windowScroll = _ref.windowScroll,
      direction = _ref.direction,
      isDropDisabled = _ref.isDropDisabled,
      isCombineEnabled = _ref.isCombineEnabled,
      shouldClipSubject = _ref.shouldClipSubject;
    var closestScrollable = env.closestScrollable;
    var client = getClient(ref, closestScrollable);
    var page = withScroll(client, windowScroll);

    var closest = function () {
      if (!closestScrollable) {
        return null;
      }

      var frameClient = getBox(closestScrollable);
      var scrollSize = {
        scrollHeight: closestScrollable.scrollHeight,
        scrollWidth: closestScrollable.scrollWidth
      };
      return {
        client: frameClient,
        page: withScroll(frameClient, windowScroll),
        scroll: getScroll$1(closestScrollable),
        scrollSize: scrollSize,
        shouldClipSubject: shouldClipSubject
      };
    }();

    var dimension = getDroppableDimension({
      descriptor: descriptor,
      isEnabled: !isDropDisabled,
      isCombineEnabled: isCombineEnabled,
      isFixedOnPage: env.isFixedOnPage,
      direction: direction,
      client: client,
      page: page,
      closest: closest
    });
    return dimension;
  });

  var _DroppableDimensionPu;

  var getClosestScrollable$1 = function getClosestScrollable(dragging) {
    return dragging && dragging.env.closestScrollable || null;
  };

  var immediate = {
    passive: false
  };
  var delayed = {
    passive: true
  };

  var getListenerOptions = function getListenerOptions(options) {
    return options.shouldPublishImmediately ? immediate : delayed;
  };

  var withoutPlaceholder = function withoutPlaceholder(placeholder, fn) {
    if (!placeholder) {
      return fn();
    }

    var last = placeholder.style.display;
    placeholder.style.display = 'none';
    var result = fn();
    placeholder.style.display = last;
    return result;
  };

  var DroppableDimensionPublisher = function (_React$Component) {
    _inheritsLoose(DroppableDimensionPublisher, _React$Component);

    function DroppableDimensionPublisher(props, context) {
      var _this;

      _this = _React$Component.call(this, props, context) || this;
      _this.dragging = void 0;
      _this.callbacks = void 0;
      _this.publishedDescriptor = null;

      _this.getClosestScroll = function () {
        var dragging = _this.dragging;

        if (!dragging || !dragging.env.closestScrollable) {
          return origin;
        }

        return getScroll$1(dragging.env.closestScrollable);
      };

      _this.memoizedUpdateScroll = index(function (x, y) {
        !_this.publishedDescriptor ? invariant(false, 'Cannot update scroll on unpublished droppable') : void 0;
        var newScroll = {
          x: x,
          y: y
        };
        var marshal = _this.context[dimensionMarshalKey];
        marshal.updateDroppableScroll(_this.publishedDescriptor.id, newScroll);
      });

      _this.updateScroll = function () {
        var scroll = _this.getClosestScroll();

        _this.memoizedUpdateScroll(scroll.x, scroll.y);
      };

      _this.scheduleScrollUpdate = index$1(_this.updateScroll);

      _this.onClosestScroll = function () {
        var dragging = _this.dragging;
        var closest$$1 = getClosestScrollable$1(_this.dragging);
        !(dragging && closest$$1) ? invariant(false, 'Could not find scroll options while scrolling') : void 0;
        var options = dragging.scrollOptions;

        if (options.shouldPublishImmediately) {
          _this.updateScroll();

          return;
        }

        _this.scheduleScrollUpdate();
      };

      _this.scroll = function (change) {
        var closest$$1 = getClosestScrollable$1(_this.dragging);
        !closest$$1 ? invariant(false, 'Cannot scroll a droppable with no closest scrollable') : void 0;
        closest$$1.scrollTop += change.y;
        closest$$1.scrollLeft += change.x;
      };

      _this.dragStopped = function () {
        var dragging = _this.dragging;
        !dragging ? invariant(false, 'Cannot stop drag when no active drag') : void 0;
        var closest$$1 = getClosestScrollable$1(dragging);
        _this.dragging = null;

        if (!closest$$1) {
          return;
        }

        _this.scheduleScrollUpdate.cancel();

        closest$$1.removeEventListener('scroll', _this.onClosestScroll, getListenerOptions(dragging.scrollOptions));
      };

      _this.getMemoizedDescriptor = index(function (id, type) {
        return {
          id: id,
          type: type
        };
      });

      _this.publish = function () {
        var marshal = _this.context[dimensionMarshalKey];

        var descriptor = _this.getMemoizedDescriptor(_this.props.droppableId, _this.props.type);

        if (!_this.publishedDescriptor) {
          marshal.registerDroppable(descriptor, _this.callbacks);
          _this.publishedDescriptor = descriptor;
          return;
        }

        if (_this.publishedDescriptor === descriptor) {
          return;
        }

        marshal.updateDroppable(_this.publishedDescriptor, descriptor, _this.callbacks);
        _this.publishedDescriptor = descriptor;
      };

      _this.unpublish = function () {
        !_this.publishedDescriptor ? invariant(false, 'Cannot unpublish descriptor when none is published') : void 0;
        var marshal = _this.context[dimensionMarshalKey];
        marshal.unregisterDroppable(_this.publishedDescriptor);
        _this.publishedDescriptor = null;
      };

      _this.recollect = function () {
        var dragging = _this.dragging;
        var closest$$1 = getClosestScrollable$1(dragging);
        !(dragging && closest$$1) ? invariant(false, 'Can only recollect Droppable client for Droppables that have a scroll container') : void 0;
        return withoutPlaceholder(_this.props.getPlaceholderRef(), function () {
          return getDimension({
            ref: dragging.ref,
            descriptor: dragging.descriptor,
            env: dragging.env,
            windowScroll: origin,
            direction: _this.props.direction,
            isDropDisabled: _this.props.isDropDisabled,
            isCombineEnabled: _this.props.isCombineEnabled,
            shouldClipSubject: !_this.props.ignoreContainerClipping
          });
        });
      };

      _this.getDimensionAndWatchScroll = function (windowScroll, options) {
        !!_this.dragging ? invariant(false, 'Cannot collect a droppable while a drag is occurring') : void 0;
        var descriptor = _this.publishedDescriptor;
        !descriptor ? invariant(false, 'Cannot get dimension for unpublished droppable') : void 0;

        var ref = _this.props.getDroppableRef();

        !ref ? invariant(false, 'Cannot collect without a droppable ref') : void 0;
        var env = getEnv(ref);
        var dragging = {
          ref: ref,
          descriptor: descriptor,
          env: env,
          scrollOptions: options
        };
        _this.dragging = dragging;
        var dimension = getDimension({
          ref: ref,
          descriptor: descriptor,
          env: env,
          windowScroll: windowScroll,
          direction: _this.props.direction,
          isDropDisabled: _this.props.isDropDisabled,
          isCombineEnabled: _this.props.isCombineEnabled,
          shouldClipSubject: !_this.props.ignoreContainerClipping
        });

        if (env.closestScrollable) {
          env.closestScrollable.addEventListener('scroll', _this.onClosestScroll, getListenerOptions(dragging.scrollOptions));

          {
            checkForNestedScrollContainers(env.closestScrollable);
          }
        }

        return dimension;
      };

      var callbacks = {
        getDimensionAndWatchScroll: _this.getDimensionAndWatchScroll,
        recollect: _this.recollect,
        dragStopped: _this.dragStopped,
        scroll: _this.scroll
      };
      _this.callbacks = callbacks;
      return _this;
    }

    var _proto = DroppableDimensionPublisher.prototype;

    _proto.componentDidMount = function componentDidMount() {
      this.publish();
    };

    _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
      this.publish();

      if (!this.dragging) {
        return;
      }

      var isDisabledChanged = this.props.isDropDisabled !== prevProps.isDropDisabled;
      var isCombineChanged = this.props.isCombineEnabled !== prevProps.isCombineEnabled;

      if (!isDisabledChanged && !isCombineChanged) {
        return;
      }

      var marshal = this.context[dimensionMarshalKey];

      if (isDisabledChanged) {
        marshal.updateDroppableIsEnabled(this.props.droppableId, !this.props.isDropDisabled);
      }

      if (isCombineChanged) {
        marshal.updateDroppableIsCombineEnabled(this.props.droppableId, this.props.isCombineEnabled);
      }
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      if (this.dragging) {
        warning$3('unmounting droppable while a drag is occurring');
        this.dragStopped();
      }

      this.unpublish();
    };

    _proto.render = function render() {
      return this.props.children;
    };

    return DroppableDimensionPublisher;
  }(React__default.Component);

  DroppableDimensionPublisher.contextTypes = (_DroppableDimensionPu = {}, _DroppableDimensionPu[dimensionMarshalKey] = propTypes.object.isRequired, _DroppableDimensionPu);

  var Placeholder = function (_PureComponent) {
    _inheritsLoose(Placeholder, _PureComponent);

    function Placeholder() {
      return _PureComponent.apply(this, arguments) || this;
    }

    var _proto = Placeholder.prototype;

    _proto.render = function render() {
      var placeholder = this.props.placeholder;
      var client = placeholder.client,
        display = placeholder.display,
        tagName = placeholder.tagName;
      var style = {
        display: display,
        boxSizing: 'border-box',
        width: client.borderBox.width,
        height: client.borderBox.height,
        marginTop: client.margin.top,
        marginRight: client.margin.right,
        marginBottom: client.margin.bottom,
        marginLeft: client.margin.left,
        flexShrink: '0',
        flexGrow: '0',
        pointerEvents: 'none'
      };
      return React__default.createElement(tagName, {
        style: style,
        ref: this.props.innerRef
      });
    };

    return Placeholder;
  }(React.PureComponent);

  var getWindowFromEl = (function (el) {
    return el && el.ownerDocument ? el.ownerDocument.defaultView : window;
  });

  function isHtmlElement(el) {
    return el instanceof getWindowFromEl(el).HTMLElement;
  }

  var throwIfRefIsInvalid = (function (ref) {
    !(ref && isHtmlElement(ref)) ? invariant(false, "\n    provided.innerRef has not been provided with a HTMLElement.\n\n    You can find a guide on using the innerRef callback functions at:\n    https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/using-inner-ref.md\n  ") : void 0;
  });

  var checkOwnProps = (function (props) {
    !props.droppableId ? invariant(false, 'A Droppable requires a droppableId prop') : void 0;
    !(typeof props.isDropDisabled === 'boolean') ? invariant(false, 'isDropDisabled must be a boolean') : void 0;
    !(typeof props.isCombineEnabled === 'boolean') ? invariant(false, 'isCombineEnabled must be a boolean') : void 0;
    !(typeof props.ignoreContainerClipping === 'boolean') ? invariant(false, 'ignoreContainerClipping must be a boolean') : void 0;
  });

  var _Droppable$contextTyp, _Droppable$childConte;

  var Droppable = function (_Component) {
    _inheritsLoose(Droppable, _Component);

    function Droppable(props, context) {
      var _this;

      _this = _Component.call(this, props, context) || this;
      _this.styleContext = void 0;
      _this.ref = null;
      _this.placeholderRef = null;

      _this.setPlaceholderRef = function (ref) {
        _this.placeholderRef = ref;
      };

      _this.getPlaceholderRef = function () {
        return _this.placeholderRef;
      };

      _this.setRef = function (ref) {
        if (ref === null) {
          return;
        }

        if (ref === _this.ref) {
          return;
        }

        _this.ref = ref;
        throwIfRefIsInvalid(ref);
      };

      _this.getDroppableRef = function () {
        return _this.ref;
      };

      _this.styleContext = context[styleContextKey];

      {
        checkOwnProps(props);
      }

      return _this;
    }

    var _proto = Droppable.prototype;

    _proto.getChildContext = function getChildContext() {
      var _value;

      var value = (_value = {}, _value[droppableIdKey] = this.props.droppableId, _value[droppableTypeKey] = this.props.type, _value);
      return value;
    };

    _proto.componentDidMount = function componentDidMount() {
      throwIfRefIsInvalid(this.ref);
      this.warnIfPlaceholderNotMounted();
    };

    _proto.componentDidUpdate = function componentDidUpdate() {
      this.warnIfPlaceholderNotMounted();
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.ref = null;
      this.placeholderRef = null;
    };

    _proto.warnIfPlaceholderNotMounted = function warnIfPlaceholderNotMounted() {

      if (!this.props.placeholder) {
        return;
      }

      if (this.placeholderRef) {
        return;
      }

      warning$3("\n      Droppable setup issue: DroppableProvided > placeholder could not be found.\n      Please be sure to add the {provided.placeholder} Node as a child of your Droppable\n\n      More information: https://github.com/atlassian/react-beautiful-dnd#1-provided-droppableprovided\n    ");
    };

    _proto.getPlaceholder = function getPlaceholder() {
      if (!this.props.placeholder) {
        return null;
      }

      return React__default.createElement(Placeholder, {
        placeholder: this.props.placeholder,
        innerRef: this.setPlaceholderRef
      });
    };

    _proto.render = function render() {
      var _this$props = this.props,
        children = _this$props.children,
        direction = _this$props.direction,
        type = _this$props.type,
        droppableId = _this$props.droppableId,
        isDropDisabled = _this$props.isDropDisabled,
        isCombineEnabled = _this$props.isCombineEnabled,
        ignoreContainerClipping = _this$props.ignoreContainerClipping,
        isDraggingOver = _this$props.isDraggingOver,
        draggingOverWith = _this$props.draggingOverWith;
      var provided = {
        innerRef: this.setRef,
        placeholder: this.getPlaceholder(),
        droppableProps: {
          'data-react-beautiful-dnd-droppable': this.styleContext
        }
      };
      var snapshot = {
        isDraggingOver: isDraggingOver,
        draggingOverWith: draggingOverWith
      };
      return React__default.createElement(DroppableDimensionPublisher, {
        droppableId: droppableId,
        type: type,
        direction: direction,
        ignoreContainerClipping: ignoreContainerClipping,
        isDropDisabled: isDropDisabled,
        isCombineEnabled: isCombineEnabled,
        getDroppableRef: this.getDroppableRef,
        getPlaceholderRef: this.getPlaceholderRef
      }, children(provided, snapshot));
    };

    return Droppable;
  }(React.Component);

  Droppable.contextTypes = (_Droppable$contextTyp = {}, _Droppable$contextTyp[styleContextKey] = propTypes.string.isRequired, _Droppable$contextTyp);
  Droppable.childContextTypes = (_Droppable$childConte = {}, _Droppable$childConte[droppableIdKey] = propTypes.string.isRequired, _Droppable$childConte[droppableTypeKey] = propTypes.string.isRequired, _Droppable$childConte);

  var isStrictEqual = (function (a, b) {
    return a === b;
  });

  var defaultMapProps = {
    isDraggingOver: false,
    draggingOverWith: null,
    placeholder: null
  };
  var makeMapStateToProps = function makeMapStateToProps() {
    var getMapProps = index(function (isDraggingOver, draggingOverWith, placeholder) {
      return {
        isDraggingOver: isDraggingOver,
        draggingOverWith: draggingOverWith,
        placeholder: placeholder
      };
    });

    var getDraggingOverProps = function getDraggingOverProps(id, draggable, impact) {
      var isOver = whatIsDraggedOver(impact) === id;

      if (!isOver) {
        return defaultMapProps;
      }

      var usePlaceholder = shouldUsePlaceholder(draggable.descriptor, impact);
      var placeholder = usePlaceholder ? draggable.placeholder : null;
      return getMapProps(true, draggable.descriptor.id, placeholder);
    };

    var selector = function selector(state, ownProps) {
      if (ownProps.isDropDisabled) {
        return defaultMapProps;
      }

      var id = ownProps.droppableId;

      if (state.isDragging) {
        var draggable = state.dimensions.draggables[state.critical.draggable.id];
        return getDraggingOverProps(id, draggable, state.impact);
      }

      if (state.phase === 'DROP_ANIMATING') {
        var _draggable = state.dimensions.draggables[state.pending.result.draggableId];
        return getDraggingOverProps(id, _draggable, state.pending.impact);
      }

      return defaultMapProps;
    };

    return selector;
  };
  var defaultProps = {
    type: 'DEFAULT',
    direction: 'vertical',
    isDropDisabled: false,
    isCombineEnabled: false,
    ignoreContainerClipping: false
  };
  var ConnectedDroppable = connect(makeMapStateToProps, null, null, {
    storeKey: storeKey,
    pure: true,
    areStatePropsEqual: isStrictEqual
  })(Droppable);
  ConnectedDroppable.defaultProps = defaultProps;

  var _DraggableDimensionPu;

  var DraggableDimensionPublisher = function (_Component) {
    _inheritsLoose(DraggableDimensionPublisher, _Component);

    function DraggableDimensionPublisher() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _Component.call.apply(_Component, [this].concat(args)) || this;
      _this.publishedDescriptor = null;
      _this.getMemoizedDescriptor = index(function (id, index$$1, droppableId, type) {
        return {
          id: id,
          index: index$$1,
          droppableId: droppableId,
          type: type
        };
      });

      _this.publish = function () {
        var marshal = _this.context[dimensionMarshalKey];

        var descriptor = _this.getMemoizedDescriptor(_this.props.draggableId, _this.props.index, _this.props.droppableId, _this.props.type);

        if (!_this.publishedDescriptor) {
          marshal.registerDraggable(descriptor, _this.getDimension);
          _this.publishedDescriptor = descriptor;
          return;
        }

        if (descriptor === _this.publishedDescriptor) {
          return;
        }

        marshal.updateDraggable(_this.publishedDescriptor, descriptor, _this.getDimension);
        _this.publishedDescriptor = descriptor;
      };

      _this.unpublish = function () {
        !_this.publishedDescriptor ? invariant(false, 'Cannot unpublish descriptor when none is published') : void 0;
        var marshal = _this.context[dimensionMarshalKey];
        marshal.unregisterDraggable(_this.publishedDescriptor);
        _this.publishedDescriptor = null;
      };

      _this.getDimension = function (windowScroll) {
        if (windowScroll === void 0) {
          windowScroll = origin;
        }

        var targetRef = _this.props.getDraggableRef();

        var descriptor = _this.publishedDescriptor;
        !targetRef ? invariant(false, 'DraggableDimensionPublisher cannot calculate a dimension when not attached to the DOM') : void 0;
        !descriptor ? invariant(false, 'Cannot get dimension for unpublished draggable') : void 0;
        var computedStyles = window.getComputedStyle(targetRef);
        var borderBox = targetRef.getBoundingClientRect();
        var client = calculateBox(borderBox, computedStyles);
        var page = withScroll(client, windowScroll);
        var placeholder = {
          client: client,
          tagName: targetRef.tagName.toLowerCase(),
          display: computedStyles.display
        };
        var displaceBy = {
          x: client.marginBox.width,
          y: client.marginBox.height
        };
        var dimension = {
          descriptor: descriptor,
          placeholder: placeholder,
          displaceBy: displaceBy,
          client: client,
          page: page
        };
        return dimension;
      };

      return _this;
    }

    var _proto = DraggableDimensionPublisher.prototype;

    _proto.componentDidMount = function componentDidMount() {
      this.publish();
    };

    _proto.componentDidUpdate = function componentDidUpdate() {
      this.publish();
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.unpublish();
    };

    _proto.render = function render() {
      return this.props.children;
    };

    return DraggableDimensionPublisher;
  }(React.Component);

  DraggableDimensionPublisher.contextTypes = (_DraggableDimensionPu = {}, _DraggableDimensionPu[dimensionMarshalKey] = propTypes.object.isRequired, _DraggableDimensionPu);

  function isSvgElement(el) {
    return el instanceof getWindowFromEl(el).SVGElement;
  }

  var selector = "[" + dragHandle + "]";

  var throwIfSVG = function throwIfSVG(el) {
    !!isSvgElement(el) ? invariant(false, "A drag handle cannot be an SVGElement: it has inconsistent focus support.\n\n    More information: https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/dragging-svgs.md") : void 0;
  };

  var getDragHandleRef = function getDragHandleRef(draggableRef) {
    if (draggableRef.hasAttribute(dragHandle)) {
      throwIfSVG(draggableRef);
      return draggableRef;
    }

    var el = draggableRef.querySelector(selector);
    throwIfSVG(draggableRef);
    !el ? invariant(false, "\n      Cannot find drag handle element inside of Draggable.\n      Please be sure to apply the {...provided.dragHandleProps} to your Draggable\n\n      More information: https://github.com/atlassian/react-beautiful-dnd#draggable\n    ") : void 0;
    !isHtmlElement(el) ? invariant(false, 'A drag handle must be a HTMLElement') : void 0;
    return el;
  };

  var retainingFocusFor = null;
  var listenerOptions = {
    capture: true
  };

  var clearRetentionOnFocusChange = function () {
    var isBound = false;

    var bind = function bind() {
      if (isBound) {
        return;
      }

      isBound = true;
      window.addEventListener('focus', onWindowFocusChange, listenerOptions);
    };

    var unbind = function unbind() {
      if (!isBound) {
        return;
      }

      isBound = false;
      window.removeEventListener('focus', onWindowFocusChange, listenerOptions);
    };

    var onWindowFocusChange = function onWindowFocusChange() {
      unbind();
      retainingFocusFor = null;
    };

    var result = function result() {
      return bind();
    };

    result.cancel = function () {
      return unbind();
    };

    return result;
  }();

  var retain = function retain(id) {
    retainingFocusFor = id;
    clearRetentionOnFocusChange();
  };

  var tryRestoreFocus = function tryRestoreFocus(id, draggableRef) {
    if (!retainingFocusFor) {
      return;
    }

    if (id !== retainingFocusFor) {
      return;
    }

    retainingFocusFor = null;
    clearRetentionOnFocusChange.cancel();
    var dragHandleRef = getDragHandleRef(draggableRef);

    if (!dragHandleRef) {
      warning$3('Could not find drag handle in the DOM to focus on it');
      return;
    }

    dragHandleRef.focus();
  };

  var retainer = {
    retain: retain,
    tryRestoreFocus: tryRestoreFocus
  };

  function isElement(el) {
    return el instanceof getWindowFromEl(el).Element;
  }

  var interactiveTagNames = {
    input: true,
    button: true,
    textarea: true,
    select: true,
    option: true,
    optgroup: true,
    video: true,
    audio: true
  };

  var isAnInteractiveElement = function isAnInteractiveElement(parent, current) {
    if (current == null) {
      return false;
    }

    var hasAnInteractiveTag = Boolean(interactiveTagNames[current.tagName.toLowerCase()]);

    if (hasAnInteractiveTag) {
      return true;
    }

    var attribute = current.getAttribute('contenteditable');

    if (attribute === 'true' || attribute === '') {
      return true;
    }

    if (current === parent) {
      return false;
    }

    return isAnInteractiveElement(parent, current.parentElement);
  };

  var shouldAllowDraggingFromTarget = (function (event, props) {
    if (props.canDragInteractiveElements) {
      return true;
    }

    var target = event.target,
      currentTarget = event.currentTarget;

    if (!isElement(target) || !isElement(currentTarget)) {
      return true;
    }

    return !isAnInteractiveElement(currentTarget, target);
  });

  var createScheduler = (function (callbacks) {
    var memoizedMove = index(function (x, y) {
      var point = {
        x: x,
        y: y
      };
      callbacks.onMove(point);
    });
    var move = index$1(function (point) {
      return memoizedMove(point.x, point.y);
    });
    var moveUp = index$1(callbacks.onMoveUp);
    var moveDown = index$1(callbacks.onMoveDown);
    var moveRight = index$1(callbacks.onMoveRight);
    var moveLeft = index$1(callbacks.onMoveLeft);
    var windowScrollMove = index$1(callbacks.onWindowScroll);

    var cancel = function cancel() {
      move.cancel();
      moveUp.cancel();
      moveDown.cancel();
      moveRight.cancel();
      moveLeft.cancel();
      windowScrollMove.cancel();
    };

    return {
      move: move,
      moveUp: moveUp,
      moveDown: moveDown,
      moveRight: moveRight,
      moveLeft: moveLeft,
      windowScrollMove: windowScrollMove,
      cancel: cancel
    };
  });

  var sloppyClickThreshold = 5;
  var isSloppyClickThresholdExceeded = (function (original, current) {
    return Math.abs(current.x - original.x) >= sloppyClickThreshold || Math.abs(current.y - original.y) >= sloppyClickThreshold;
  });

  var tab = 9;
  var enter = 13;
  var escape = 27;
  var space = 32;
  var pageUp = 33;
  var pageDown = 34;
  var end = 35;
  var home = 36;
  var arrowLeft = 37;
  var arrowUp = 38;
  var arrowRight = 39;
  var arrowDown = 40;

  var _preventedKeys;
  var preventedKeys = (_preventedKeys = {}, _preventedKeys[enter] = true, _preventedKeys[tab] = true, _preventedKeys);
  var preventStandardKeyEvents = (function (event) {
    if (preventedKeys[event.keyCode]) {
      event.preventDefault();
    }
  });

  var getOptions = function getOptions(shared, fromBinding) {
    return _extends({}, shared, {}, fromBinding);
  };

  var bindEvents = function bindEvents(el, bindings, sharedOptions) {
    bindings.forEach(function (binding) {
      var options = getOptions(sharedOptions, binding.options);
      el.addEventListener(binding.eventName, binding.fn, options);
    });
  };
  var unbindEvents = function unbindEvents(el, bindings, sharedOptions) {
    bindings.forEach(function (binding) {
      var options = getOptions(sharedOptions, binding.options);
      el.removeEventListener(binding.eventName, binding.fn, options);
    });
  };

  var sharedOptions = {
    capture: true
  };
  var createPostDragEventPreventer = (function (getWindow) {
    var isBound = false;

    var bind = function bind() {
      if (isBound) {
        return;
      }

      isBound = true;
      bindEvents(getWindow(), pointerEvents, sharedOptions);
    };

    var unbind = function unbind() {
      if (!isBound) {
        return;
      }

      isBound = false;
      unbindEvents(getWindow(), pointerEvents, sharedOptions);
    };

    var pointerEvents = [{
      eventName: 'click',
      fn: function fn(event) {
        event.preventDefault();
        unbind();
      }
    }, {
      eventName: 'mousedown',
      fn: unbind
    }, {
      eventName: 'touchstart',
      fn: unbind
    }];

    var preventNext = function preventNext() {
      if (isBound) {
        unbind();
      }

      bind();
    };

    var preventer = {
      preventNext: preventNext,
      abort: unbind
    };
    return preventer;
  });

  var createEventMarshal = (function () {
    var isMouseDownHandled = false;

    var handle = function handle() {
      !!isMouseDownHandled ? invariant(false, 'Cannot handle mouse down as it is already handled') : void 0;
      isMouseDownHandled = true;
    };

    var isHandled = function isHandled() {
      return isMouseDownHandled;
    };

    var reset = function reset() {
      isMouseDownHandled = false;
    };

    return {
      handle: handle,
      isHandled: isHandled,
      reset: reset
    };
  });

  var supportedEventName = function () {
    var base = 'visibilitychange';

    if (typeof document === 'undefined') {
      return base;
    }

    var candidates = [base, "ms" + base, "webkit" + base, "moz" + base, "o" + base];
    var supported = find(candidates, function (eventName) {
      return "on" + eventName in document;
    });
    return supported || base;
  }();

  var primaryButton = 0;

  var noop$1 = function noop() {};

  var mouseDownMarshal = createEventMarshal();
  var createMouseSensor = (function (_ref) {
    var callbacks = _ref.callbacks,
      getWindow = _ref.getWindow,
      canStartCapturing = _ref.canStartCapturing;
    var state = {
      isDragging: false,
      pending: null
    };

    var setState = function setState(newState) {
      state = newState;
    };

    var isDragging = function isDragging() {
      return state.isDragging;
    };

    var isCapturing = function isCapturing() {
      return Boolean(state.pending || state.isDragging);
    };

    var schedule = createScheduler(callbacks);
    var postDragEventPreventer = createPostDragEventPreventer(getWindow);

    var startDragging = function startDragging(fn) {
      if (fn === void 0) {
        fn = noop$1;
      }

      setState({
        pending: null,
        isDragging: true
      });
      fn();
    };

    var stopDragging = function stopDragging(fn, shouldBlockClick) {
      if (fn === void 0) {
        fn = noop$1;
      }

      if (shouldBlockClick === void 0) {
        shouldBlockClick = true;
      }

      schedule.cancel();
      unbindWindowEvents();
      mouseDownMarshal.reset();

      if (shouldBlockClick) {
        postDragEventPreventer.preventNext();
      }

      setState({
        isDragging: false,
        pending: null
      });
      fn();
    };

    var startPendingDrag = function startPendingDrag(point) {
      setState({
        pending: point,
        isDragging: false
      });
      bindWindowEvents();
    };

    var stopPendingDrag = function stopPendingDrag() {
      stopDragging(noop$1, false);
    };

    var kill = function kill(fn) {
      if (fn === void 0) {
        fn = noop$1;
      }

      if (state.pending) {
        stopPendingDrag();
        return;
      }

      if (state.isDragging) {
        stopDragging(fn);
      }
    };

    var unmount = function unmount() {
      kill();
      postDragEventPreventer.abort();
    };

    var cancel = function cancel() {
      kill(callbacks.onCancel);
    };

    var windowBindings = [{
      eventName: 'mousemove',
      fn: function fn(event) {
        var button = event.button,
          clientX = event.clientX,
          clientY = event.clientY;

        if (button !== primaryButton) {
          return;
        }

        var point = {
          x: clientX,
          y: clientY
        };

        if (state.isDragging) {
          event.preventDefault();
          schedule.move(point);
          return;
        }

        if (!state.pending) {
          stopPendingDrag();
          invariant(false, 'Expected there to be an active or pending drag when window mousemove event is received');
        }

        if (!isSloppyClickThresholdExceeded(state.pending, point)) {
          return;
        }

        event.preventDefault();
        startDragging(function () {
          return callbacks.onLift({
            clientSelection: point,
            movementMode: 'FLUID'
          });
        });
      }
    }, {
      eventName: 'mouseup',
      fn: function fn(event) {
        if (state.pending) {
          stopPendingDrag();
          return;
        }

        event.preventDefault();
        stopDragging(callbacks.onDrop);
      }
    }, {
      eventName: 'mousedown',
      fn: function fn(event) {
        if (state.isDragging) {
          event.preventDefault();
        }

        stopDragging(callbacks.onCancel);
      }
    }, {
      eventName: 'keydown',
      fn: function fn(event) {
        if (!state.isDragging) {
          cancel();
          return;
        }

        if (event.keyCode === escape) {
          event.preventDefault();
          cancel();
          return;
        }

        preventStandardKeyEvents(event);
      }
    }, {
      eventName: 'resize',
      fn: cancel
    }, {
      eventName: 'scroll',
      options: {
        passive: true,
        capture: false
      },
      fn: function fn() {
        if (state.pending) {
          stopPendingDrag();
          return;
        }

        schedule.windowScrollMove();
      }
    }, {
      eventName: 'webkitmouseforcechanged',
      fn: function fn(event) {
        if (event.webkitForce == null || MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN == null) {
          warning$3('handling a mouse force changed event when it is not supported');
          return;
        }

        var forcePressThreshold = MouseEvent.WEBKIT_FORCE_AT_FORCE_MOUSE_DOWN;
        var isForcePressing = event.webkitForce >= forcePressThreshold;

        if (isForcePressing) {
          cancel();
        }
      }
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];

    var bindWindowEvents = function bindWindowEvents() {
      var win = getWindow();
      bindEvents(win, windowBindings, {
        capture: true
      });
    };

    var unbindWindowEvents = function unbindWindowEvents() {
      var win = getWindow();
      unbindEvents(win, windowBindings, {
        capture: true
      });
    };

    var onMouseDown = function onMouseDown(event) {
      if (mouseDownMarshal.isHandled()) {
        return;
      }

      !!isCapturing() ? invariant(false, 'Should not be able to perform a mouse down while a drag or pending drag is occurring') : void 0;

      if (!canStartCapturing(event)) {
        return;
      }

      if (event.button !== primaryButton) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }

      mouseDownMarshal.handle();
      event.preventDefault();
      var point = {
        x: event.clientX,
        y: event.clientY
      };
      startPendingDrag(point);
    };

    var sensor = {
      onMouseDown: onMouseDown,
      kill: kill,
      isCapturing: isCapturing,
      isDragging: isDragging,
      unmount: unmount
    };
    return sensor;
  });

  var getBorderBoxCenterPosition = (function (el) {
    return getRect(el.getBoundingClientRect()).center;
  });

  var _scrollJumpKeys;
  var scrollJumpKeys = (_scrollJumpKeys = {}, _scrollJumpKeys[pageDown] = true, _scrollJumpKeys[pageUp] = true, _scrollJumpKeys[home] = true, _scrollJumpKeys[end] = true, _scrollJumpKeys);

  var noop$2 = function noop() {};

  var createKeyboardSensor = (function (_ref) {
    var callbacks = _ref.callbacks,
      getWindow = _ref.getWindow,
      getDraggableRef = _ref.getDraggableRef,
      canStartCapturing = _ref.canStartCapturing;
    var state = {
      isDragging: false
    };

    var setState = function setState(newState) {
      state = newState;
    };

    var startDragging = function startDragging(fn) {
      if (fn === void 0) {
        fn = noop$2;
      }

      setState({
        isDragging: true
      });
      bindWindowEvents();
      fn();
    };

    var stopDragging = function stopDragging(postDragFn) {
      if (postDragFn === void 0) {
        postDragFn = noop$2;
      }

      schedule.cancel();
      unbindWindowEvents();
      setState({
        isDragging: false
      });
      postDragFn();
    };

    var kill = function kill() {
      if (state.isDragging) {
        stopDragging();
      }
    };

    var cancel = function cancel() {
      stopDragging(callbacks.onCancel);
    };

    var isDragging = function isDragging() {
      return state.isDragging;
    };

    var schedule = createScheduler(callbacks);

    var onKeyDown = function onKeyDown(event) {
      if (!isDragging()) {
        if (event.defaultPrevented) {
          return;
        }

        if (!canStartCapturing(event)) {
          return;
        }

        if (event.keyCode !== space) {
          return;
        }

        var ref = getDraggableRef();
        !ref ? invariant(false, 'Cannot start a keyboard drag without a draggable ref') : void 0;
        var center = getBorderBoxCenterPosition(ref);
        event.preventDefault();
        startDragging(function () {
          return callbacks.onLift({
            clientSelection: center,
            movementMode: 'SNAP'
          });
        });
        return;
      }

      if (event.keyCode === escape) {
        event.preventDefault();
        cancel();
        return;
      }

      if (event.keyCode === space) {
        event.preventDefault();
        stopDragging(callbacks.onDrop);
        return;
      }

      if (event.keyCode === arrowDown) {
        event.preventDefault();
        schedule.moveDown();
        return;
      }

      if (event.keyCode === arrowUp) {
        event.preventDefault();
        schedule.moveUp();
        return;
      }

      if (event.keyCode === arrowRight) {
        event.preventDefault();
        schedule.moveRight();
        return;
      }

      if (event.keyCode === arrowLeft) {
        event.preventDefault();
        schedule.moveLeft();
        return;
      }

      if (scrollJumpKeys[event.keyCode]) {
        event.preventDefault();
        return;
      }

      preventStandardKeyEvents(event);
    };

    var windowBindings = [{
      eventName: 'mousedown',
      fn: cancel
    }, {
      eventName: 'mouseup',
      fn: cancel
    }, {
      eventName: 'click',
      fn: cancel
    }, {
      eventName: 'touchstart',
      fn: cancel
    }, {
      eventName: 'resize',
      fn: cancel
    }, {
      eventName: 'wheel',
      fn: cancel,
      options: {
        passive: true
      }
    }, {
      eventName: 'scroll',
      options: {
        capture: false
      },
      fn: callbacks.onWindowScroll
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];

    var bindWindowEvents = function bindWindowEvents() {
      bindEvents(getWindow(), windowBindings, {
        capture: true
      });
    };

    var unbindWindowEvents = function unbindWindowEvents() {
      unbindEvents(getWindow(), windowBindings, {
        capture: true
      });
    };

    var sensor = {
      onKeyDown: onKeyDown,
      kill: kill,
      isDragging: isDragging,
      isCapturing: isDragging,
      unmount: kill
    };
    return sensor;
  });

  var timeForLongPress = 150;
  var forcePressThreshold = 0.15;
  var touchStartMarshal = createEventMarshal();

  var noop$3 = function noop() {};

  var webkitHack = function () {
    var stub = {
      preventTouchMove: noop$3,
      releaseTouchMove: noop$3
    };

    if (typeof window === 'undefined') {
      return stub;
    }

    if (!('ontouchstart' in window)) {
      return stub;
    }

    var isBlocking = false;
    window.addEventListener('touchmove', function (event) {
      if (!isBlocking) {
        return;
      }

      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();
    }, {
      passive: false,
      capture: false
    });

    var preventTouchMove = function preventTouchMove() {
      isBlocking = true;
    };

    var releaseTouchMove = function releaseTouchMove() {
      isBlocking = false;
    };

    return {
      preventTouchMove: preventTouchMove,
      releaseTouchMove: releaseTouchMove
    };
  }();

  var initial = {
    isDragging: false,
    pending: null,
    hasMoved: false,
    longPressTimerId: null
  };
  var createTouchSensor = (function (_ref) {
    var callbacks = _ref.callbacks,
      getWindow = _ref.getWindow,
      canStartCapturing = _ref.canStartCapturing;
    var state = initial;

    var setState = function setState(partial) {
      state = _extends({}, state, {}, partial);
    };

    var isDragging = function isDragging() {
      return state.isDragging;
    };

    var isCapturing = function isCapturing() {
      return Boolean(state.pending || state.isDragging || state.longPressTimerId);
    };

    var schedule = createScheduler(callbacks);
    var postDragEventPreventer = createPostDragEventPreventer(getWindow);

    var startDragging = function startDragging() {
      var pending = state.pending;

      if (!pending) {
        stopPendingDrag();
        invariant(false, 'cannot start a touch drag without a pending position');
      }

      setState({
        isDragging: true,
        hasMoved: false,
        pending: null,
        longPressTimerId: null
      });
      callbacks.onLift({
        clientSelection: pending,
        movementMode: 'FLUID'
      });
    };

    var stopDragging = function stopDragging(fn) {
      if (fn === void 0) {
        fn = noop$3;
      }

      schedule.cancel();
      touchStartMarshal.reset();
      webkitHack.releaseTouchMove();
      unbindWindowEvents();
      postDragEventPreventer.preventNext();
      setState(initial);
      fn();
    };

    var startPendingDrag = function startPendingDrag(event) {
      var touch = event.touches[0];
      var clientX = touch.clientX,
        clientY = touch.clientY;
      var point = {
        x: clientX,
        y: clientY
      };
      var longPressTimerId = setTimeout(startDragging, timeForLongPress);
      setState({
        longPressTimerId: longPressTimerId,
        pending: point,
        isDragging: false,
        hasMoved: false
      });
      bindWindowEvents();
    };

    var stopPendingDrag = function stopPendingDrag() {
      if (state.longPressTimerId) {
        clearTimeout(state.longPressTimerId);
      }

      schedule.cancel();
      touchStartMarshal.reset();
      webkitHack.releaseTouchMove();
      unbindWindowEvents();
      setState(initial);
    };

    var kill = function kill(fn) {
      if (fn === void 0) {
        fn = noop$3;
      }

      if (state.pending) {
        stopPendingDrag();
        return;
      }

      if (state.isDragging) {
        stopDragging(fn);
      }
    };

    var unmount = function unmount() {
      kill();
      postDragEventPreventer.abort();
    };

    var cancel = function cancel() {
      kill(callbacks.onCancel);
    };

    var windowBindings = [{
      eventName: 'touchmove',
      options: {
        passive: false
      },
      fn: function fn(event) {
        if (!state.isDragging) {
          stopPendingDrag();
          return;
        }

        if (!state.hasMoved) {
          setState({
            hasMoved: true
          });
        }

        var _event$touches$ = event.touches[0],
          clientX = _event$touches$.clientX,
          clientY = _event$touches$.clientY;
        var point = {
          x: clientX,
          y: clientY
        };
        event.preventDefault();
        schedule.move(point);
      }
    }, {
      eventName: 'touchend',
      fn: function fn(event) {
        if (!state.isDragging) {
          stopPendingDrag();
          return;
        }

        event.preventDefault();
        stopDragging(callbacks.onDrop);
      }
    }, {
      eventName: 'touchcancel',
      fn: function fn(event) {
        if (!state.isDragging) {
          stopPendingDrag();
          return;
        }

        event.preventDefault();
        stopDragging(callbacks.onCancel);
      }
    }, {
      eventName: 'touchstart',
      fn: cancel
    }, {
      eventName: 'orientationchange',
      fn: cancel
    }, {
      eventName: 'resize',
      fn: cancel
    }, {
      eventName: 'scroll',
      options: {
        passive: true,
        capture: false
      },
      fn: function fn() {
        if (state.pending) {
          stopPendingDrag();
          return;
        }

        schedule.windowScrollMove();
      }
    }, {
      eventName: 'contextmenu',
      fn: function fn(event) {
        event.preventDefault();
      }
    }, {
      eventName: 'keydown',
      fn: function fn(event) {
        if (!state.isDragging) {
          cancel();
          return;
        }

        if (event.keyCode === escape) {
          event.preventDefault();
        }

        cancel();
      }
    }, {
      eventName: 'touchforcechange',
      fn: function fn(event) {
        if (state.hasMoved) {
          event.preventDefault();
          return;
        }

        var touch = event.touches[0];

        if (touch.force >= forcePressThreshold) {
          cancel();
        }
      }
    }, {
      eventName: supportedEventName,
      fn: cancel
    }];

    var bindWindowEvents = function bindWindowEvents() {
      bindEvents(getWindow(), windowBindings, {
        capture: true
      });
    };

    var unbindWindowEvents = function unbindWindowEvents() {
      unbindEvents(getWindow(), windowBindings, {
        capture: true
      });
    };

    var onTouchStart = function onTouchStart(event) {
      if (touchStartMarshal.isHandled()) {
        return;
      }

      !!isCapturing() ? invariant(false, 'Should not be able to perform a touch start while a drag or pending drag is occurring') : void 0;

      if (!canStartCapturing(event)) {
        return;
      }

      touchStartMarshal.handle();
      webkitHack.preventTouchMove();
      startPendingDrag(event);
    };

    var sensor = {
      onTouchStart: onTouchStart,
      kill: kill,
      isCapturing: isCapturing,
      isDragging: isDragging,
      unmount: unmount
    };
    return sensor;
  });

  var _DragHandle$contextTy;

  var preventHtml5Dnd = function preventHtml5Dnd(event) {
    event.preventDefault();
  };

  var DragHandle = function (_Component) {
    _inheritsLoose(DragHandle, _Component);

    function DragHandle(props, context) {
      var _this;

      _this = _Component.call(this, props, context) || this;
      _this.mouseSensor = void 0;
      _this.keyboardSensor = void 0;
      _this.touchSensor = void 0;
      _this.sensors = void 0;
      _this.styleContext = void 0;
      _this.canLift = void 0;
      _this.isFocused = false;
      _this.lastDraggableRef = void 0;

      _this.onFocus = function () {
        _this.isFocused = true;
      };

      _this.onBlur = function () {
        _this.isFocused = false;
      };

      _this.onKeyDown = function (event) {
        if (_this.mouseSensor.isCapturing() || _this.touchSensor.isCapturing()) {
          return;
        }

        _this.keyboardSensor.onKeyDown(event);
      };

      _this.onMouseDown = function (event) {
        if (_this.keyboardSensor.isCapturing() || _this.mouseSensor.isCapturing()) {
          return;
        }

        _this.mouseSensor.onMouseDown(event);
      };

      _this.onTouchStart = function (event) {
        if (_this.mouseSensor.isCapturing() || _this.keyboardSensor.isCapturing()) {
          return;
        }

        _this.touchSensor.onTouchStart(event);
      };

      _this.canStartCapturing = function (event) {
        if (_this.isAnySensorCapturing()) {
          return false;
        }

        if (!_this.canLift(_this.props.draggableId)) {
          return false;
        }

        return shouldAllowDraggingFromTarget(event, _this.props);
      };

      _this.isAnySensorCapturing = function () {
        return _this.sensors.some(function (sensor) {
          return sensor.isCapturing();
        });
      };

      _this.getProvided = index(function (isEnabled) {
        if (!isEnabled) {
          return null;
        }

        var provided = {
          onMouseDown: _this.onMouseDown,
          onKeyDown: _this.onKeyDown,
          onTouchStart: _this.onTouchStart,
          onFocus: _this.onFocus,
          onBlur: _this.onBlur,
          tabIndex: 0,
          'data-react-beautiful-dnd-drag-handle': _this.styleContext,
          'aria-roledescription': 'Draggable item. Press space bar to lift',
          draggable: false,
          onDragStart: preventHtml5Dnd
        };
        return provided;
      });

      var getWindow = function getWindow() {
        return getWindowFromEl(_this.props.getDraggableRef());
      };

      var args = {
        callbacks: _this.props.callbacks,
        getDraggableRef: _this.props.getDraggableRef,
        getWindow: getWindow,
        canStartCapturing: _this.canStartCapturing
      };
      _this.mouseSensor = createMouseSensor(args);
      _this.keyboardSensor = createKeyboardSensor(args);
      _this.touchSensor = createTouchSensor(args);
      _this.sensors = [_this.mouseSensor, _this.keyboardSensor, _this.touchSensor];
      _this.styleContext = context[styleContextKey];
      _this.canLift = context[canLiftContextKey];
      return _this;
    }

    var _proto = DragHandle.prototype;

    _proto.componentDidMount = function componentDidMount() {
      var draggableRef = this.props.getDraggableRef();
      this.lastDraggableRef = draggableRef;
      !draggableRef ? invariant(false, 'Cannot get draggable ref from drag handle') : void 0;

      if (!this.props.isEnabled) {
        return;
      }

      var dragHandleRef = getDragHandleRef(draggableRef);
      retainer.tryRestoreFocus(this.props.draggableId, dragHandleRef);
    };

    _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
      var _this2 = this;

      var ref = this.props.getDraggableRef();

      if (ref !== this.lastDraggableRef) {
        this.lastDraggableRef = ref;

        if (ref && this.isFocused && this.props.isEnabled) {
          getDragHandleRef(ref).focus();
        }
      }

      var isCapturing = this.isAnySensorCapturing();

      if (!isCapturing) {
        return;
      }

      var isBeingDisabled = prevProps.isEnabled && !this.props.isEnabled;

      if (isBeingDisabled) {
        this.sensors.forEach(function (sensor) {
          if (!sensor.isCapturing()) {
            return;
          }

          var wasDragging = sensor.isDragging();
          sensor.kill();

          if (wasDragging) {
            warning$3('You have disabled dragging on a Draggable while it was dragging. The drag has been cancelled');

            _this2.props.callbacks.onCancel();
          }
        });
      }

      var isDragAborted = prevProps.isDragging && !this.props.isDragging;

      if (isDragAborted) {
        this.sensors.forEach(function (sensor) {
          if (sensor.isCapturing()) {
            sensor.kill();
          }
        });
      }
    };

    _proto.componentWillUnmount = function componentWillUnmount() {
      var _this3 = this;

      this.sensors.forEach(function (sensor) {
        var wasDragging = sensor.isDragging();
        sensor.unmount();

        if (wasDragging) {
          _this3.props.callbacks.onCancel();
        }
      });

      var shouldRetainFocus = function () {
        if (!_this3.props.isEnabled) {
          return false;
        }

        if (!_this3.isFocused) {
          return false;
        }

        return _this3.props.isDragging || _this3.props.isDropAnimating;
      }();

      if (shouldRetainFocus) {
        retainer.retain(this.props.draggableId);
      }
    };

    _proto.render = function render() {
      var _this$props = this.props,
        children = _this$props.children,
        isEnabled = _this$props.isEnabled;
      return children(this.getProvided(isEnabled));
    };

    return DragHandle;
  }(React.Component);

  DragHandle.contextTypes = (_DragHandle$contextTy = {}, _DragHandle$contextTy[styleContextKey] = propTypes.string.isRequired, _DragHandle$contextTy[canLiftContextKey] = propTypes.func.isRequired, _DragHandle$contextTy);

  // 20.1.2.3 Number.isInteger(number)

  var floor$1 = Math.floor;
  var _isInteger = function isInteger(it) {
    return !_isObject(it) && isFinite(it) && floor$1(it) === it;
  };

  // 20.1.2.3 Number.isInteger(number)


  _export(_export.S, 'Number', { isInteger: _isInteger });

  var isInteger = _core.Number.isInteger;

  var isInteger$1 = isInteger;

  var checkOwnProps$1 = (function (props) {
    !isInteger$1(props.index) ? invariant(false, 'Draggable requires an integer index prop') : void 0;
    !props.draggableId ? invariant(false, 'Draggable requires a draggableId') : void 0;
    !(typeof props.isDragDisabled === 'boolean') ? invariant(false, 'isDragDisabled must be a boolean') : void 0;
  });

  var _Draggable$contextTyp;
  var zIndexOptions = {
    dragging: 5000,
    dropAnimating: 4500
  };

  var getDraggingTransition = function getDraggingTransition(shouldAnimateDragMovement, dropping) {
    if (dropping) {
      return transitions.drop(dropping.duration);
    }

    if (shouldAnimateDragMovement) {
      return transitions.snap;
    }

    return transitions.fluid;
  };

  var getDraggingOpacity = function getDraggingOpacity(isCombining, isDropAnimating) {
    if (!isCombining) {
      return null;
    }

    return isDropAnimating ? combine.opacity.drop : combine.opacity.combining;
  };

  var getShouldDraggingAnimate = function getShouldDraggingAnimate(dragging) {
    if (dragging.forceShouldAnimate != null) {
      return dragging.forceShouldAnimate;
    }

    return dragging.mode === 'SNAP';
  };

  var Draggable = function (_Component) {
    _inheritsLoose(Draggable, _Component);

    function Draggable(props, context) {
      var _this;

      _this = _Component.call(this, props, context) || this;
      _this.callbacks = void 0;
      _this.styleContext = void 0;
      _this.ref = null;

      _this.onMoveEnd = function () {
        if (_this.props.dragging && _this.props.dragging.dropping) {
          _this.props.dropAnimationFinished();
        }
      };

      _this.onLift = function (options) {
        start('LIFT');
        var ref = _this.ref;
        !ref ? invariant(false) : void 0;
        !!_this.props.isDragDisabled ? invariant(false, 'Cannot lift a Draggable when it is disabled') : void 0;
        var clientSelection = options.clientSelection,
          movementMode = options.movementMode;
        var _this$props = _this.props,
          lift = _this$props.lift,
          draggableId = _this$props.draggableId;
        lift({
          id: draggableId,
          clientSelection: clientSelection,
          movementMode: movementMode
        });
        finish('LIFT');
      };

      _this.setRef = function (ref) {
        if (ref === null) {
          return;
        }

        if (ref === _this.ref) {
          return;
        }

        _this.ref = ref;
        throwIfRefIsInvalid(ref);
      };

      _this.getDraggableRef = function () {
        return _this.ref;
      };

      _this.getDraggingStyle = index(function (dragging) {
        var dimension = dragging.dimension;
        var box = dimension.client;
        var offset = dragging.offset,
          combineWith = dragging.combineWith,
          dropping = dragging.dropping;
        var isCombining = Boolean(combineWith);
        var shouldAnimate = getShouldDraggingAnimate(dragging);
        var isDropAnimating = Boolean(dropping);
        var transform = isDropAnimating ? transforms.drop(offset, isCombining) : transforms.moveTo(offset);
        var style = {
          position: 'fixed',
          top: box.marginBox.top,
          left: box.marginBox.left,
          boxSizing: 'border-box',
          width: box.borderBox.width,
          height: box.borderBox.height,
          transition: getDraggingTransition(shouldAnimate, dropping),
          transform: transform,
          opacity: getDraggingOpacity(isCombining, isDropAnimating),
          zIndex: isDropAnimating ? zIndexOptions.dropAnimating : zIndexOptions.dragging,
          pointerEvents: 'none'
        };
        return style;
      });
      _this.getSecondaryStyle = index(function (secondary) {
        return {
          transform: transforms.moveTo(secondary.offset),
          transition: secondary.shouldAnimateDisplacement ? null : 'none'
        };
      });
      _this.getDraggingProvided = index(function (dragging, dragHandleProps) {
        var style = _this.getDraggingStyle(dragging);

        var isDropping = Boolean(dragging.dropping);
        var provided = {
          innerRef: _this.setRef,
          draggableProps: {
            'data-react-beautiful-dnd-draggable': _this.styleContext,
            style: style,
            onTransitionEnd: isDropping ? _this.onMoveEnd : null
          },
          dragHandleProps: dragHandleProps
        };
        return provided;
      });
      _this.getSecondaryProvided = index(function (secondary, dragHandleProps) {
        var style = _this.getSecondaryStyle(secondary);

        var provided = {
          innerRef: _this.setRef,
          draggableProps: {
            'data-react-beautiful-dnd-draggable': _this.styleContext,
            style: style,
            onTransitionEnd: null
          },
          dragHandleProps: dragHandleProps
        };
        return provided;
      });
      _this.getDraggingSnapshot = index(function (dragging) {
        return {
          isDragging: true,
          isDropAnimating: Boolean(dragging.dropping),
          dropAnimation: dragging.dropping,
          mode: dragging.mode,
          draggingOver: dragging.draggingOver,
          combineWith: dragging.combineWith,
          combineTargetFor: null
        };
      });
      _this.getSecondarySnapshot = index(function (secondary) {
        return {
          isDragging: false,
          isDropAnimating: false,
          dropAnimation: null,
          mode: null,
          draggingOver: null,
          combineTargetFor: secondary.combineTargetFor,
          combineWith: null
        };
      });

      _this.renderChildren = function (dragHandleProps) {
        var dragging = _this.props.dragging;
        var secondary = _this.props.secondary;
        var children = _this.props.children;

        if (dragging) {
          var _child = children(_this.getDraggingProvided(dragging, dragHandleProps), _this.getDraggingSnapshot(dragging));

          var placeholder = React__default.createElement(Placeholder, {
            placeholder: dragging.dimension.placeholder
          });
          return React__default.createElement(React.Fragment, null, _child, placeholder);
        }

        !secondary ? invariant(false, 'If no DraggingMapProps are provided, then SecondaryMapProps are required') : void 0;
        var child = children(_this.getSecondaryProvided(secondary, dragHandleProps), _this.getSecondarySnapshot(secondary));
        return React__default.createElement(React.Fragment, null, child);
      };

      var callbacks = {
        onLift: _this.onLift,
        onMove: function onMove(clientSelection) {
          return props.move({
            client: clientSelection
          });
        },
        onDrop: function onDrop() {
          return props.drop({
            reason: 'DROP'
          });
        },
        onCancel: function onCancel() {
          return props.drop({
            reason: 'CANCEL'
          });
        },
        onMoveUp: props.moveUp,
        onMoveDown: props.moveDown,
        onMoveRight: props.moveRight,
        onMoveLeft: props.moveLeft,
        onWindowScroll: function onWindowScroll() {
          return props.moveByWindowScroll({
            newScroll: getWindowScroll$1()
          });
        }
      };
      _this.callbacks = callbacks;
      _this.styleContext = context[styleContextKey];

      {
        checkOwnProps$1(props);
      }

      return _this;
    }

    var _proto = Draggable.prototype;

    _proto.componentWillUnmount = function componentWillUnmount() {
      this.ref = null;
    };

    _proto.render = function render() {
      var _this$props2 = this.props,
        draggableId = _this$props2.draggableId,
        index$$1 = _this$props2.index,
        dragging = _this$props2.dragging,
        isDragDisabled = _this$props2.isDragDisabled,
        disableInteractiveElementBlocking = _this$props2.disableInteractiveElementBlocking;
      var droppableId = this.context[droppableIdKey];
      var type = this.context[droppableTypeKey];
      var isDragging = Boolean(dragging);
      var isDropAnimating = Boolean(dragging && dragging.dropping);
      return React__default.createElement(DraggableDimensionPublisher, {
        key: draggableId,
        draggableId: draggableId,
        droppableId: droppableId,
        type: type,
        index: index$$1,
        getDraggableRef: this.getDraggableRef
      }, React__default.createElement(DragHandle, {
        draggableId: draggableId,
        isDragging: isDragging,
        isDropAnimating: isDropAnimating,
        isEnabled: !isDragDisabled,
        callbacks: this.callbacks,
        getDraggableRef: this.getDraggableRef,
        canDragInteractiveElements: disableInteractiveElementBlocking
      }, this.renderChildren));
    };

    return Draggable;
  }(React.Component);

  Draggable.contextTypes = (_Draggable$contextTyp = {}, _Draggable$contextTyp[droppableIdKey] = propTypes.string.isRequired, _Draggable$contextTyp[droppableTypeKey] = propTypes.string.isRequired, _Draggable$contextTyp[styleContextKey] = propTypes.string.isRequired, _Draggable$contextTyp);

  var getCombineWith = function getCombineWith(impact) {
    if (!impact.merge) {
      return null;
    }

    return impact.merge.combine.draggableId;
  };

  var defaultMapProps$1 = {
    secondary: {
      offset: origin,
      combineTargetFor: null,
      shouldAnimateDisplacement: true
    },
    dragging: null
  };
  var makeMapStateToProps$1 = function makeMapStateToProps() {
    var memoizedOffset = index(function (x, y) {
      return {
        x: x,
        y: y
      };
    });
    var getSecondaryProps = index(function (offset, combineTargetFor, shouldAnimateDisplacement) {
      if (combineTargetFor === void 0) {
        combineTargetFor = null;
      }

      return {
        secondary: {
          offset: offset,
          combineTargetFor: combineTargetFor,
          shouldAnimateDisplacement: shouldAnimateDisplacement
        },
        dragging: null
      };
    });
    var getDraggingProps = index(function (offset, mode, dimension, draggingOver, combineWith, forceShouldAnimate) {
      return {
        dragging: {
          mode: mode,
          dropping: null,
          offset: offset,
          dimension: dimension,
          draggingOver: draggingOver,
          combineWith: combineWith,
          forceShouldAnimate: forceShouldAnimate
        },
        secondary: null
      };
    });

    var getSecondaryMovement = function getSecondaryMovement(ownId, draggingId, impact) {
      var map = impact.movement.map;
      var displacement = map[ownId];
      var movement = impact.movement;
      var merge = impact.merge;
      var isCombinedWith = Boolean(merge && merge.combine.draggableId === ownId);
      var displacedBy = movement.displacedBy.point;
      var offset = memoizedOffset(displacedBy.x, displacedBy.y);

      if (isCombinedWith) {
        return getSecondaryProps(displacement ? offset : origin, draggingId, displacement ? displacement.shouldAnimate : true);
      }

      if (!displacement) {
        return null;
      }

      if (!displacement.isVisible) {
        return null;
      }

      return getSecondaryProps(offset, null, displacement.shouldAnimate);
    };

    var draggingSelector = function draggingSelector(state, ownProps) {
      if (state.isDragging) {
        if (state.critical.draggable.id !== ownProps.draggableId) {
          return null;
        }

        var offset = state.current.client.offset;
        var dimension = state.dimensions.draggables[ownProps.draggableId];
        var mode = state.movementMode;
        var draggingOver = whatIsDraggedOver(state.impact);
        var combineWith = getCombineWith(state.impact);
        var forceShouldAnimate = state.forceShouldAnimate;
        return getDraggingProps(memoizedOffset(offset.x, offset.y), mode, dimension, draggingOver, combineWith, forceShouldAnimate);
      }

      if (state.phase === 'DROP_ANIMATING') {
        var pending = state.pending;

        if (pending.result.draggableId !== ownProps.draggableId) {
          return null;
        }

        var _draggingOver = whatIsDraggedOver(pending.impact);

        var _combineWith = getCombineWith(pending.impact);

        var duration = pending.dropDuration;
        var _mode = pending.result.mode;
        return {
          dragging: {
            offset: pending.newHomeClientOffset,
            dimension: state.dimensions.draggables[ownProps.draggableId],
            draggingOver: _draggingOver,
            combineWith: _combineWith,
            mode: _mode,
            forceShouldAnimate: null,
            dropping: {
              duration: duration,
              curve: curves.drop,
              moveTo: pending.newHomeClientOffset,
              opacity: _combineWith ? combine.opacity.drop : null,
              scale: _combineWith ? combine.scale.drop : null
            }
          },
          secondary: null
        };
      }

      return null;
    };

    var secondarySelector = function secondarySelector(state, ownProps) {
      if (state.isDragging) {
        if (state.critical.draggable.id === ownProps.draggableId) {
          return null;
        }

        return getSecondaryMovement(ownProps.draggableId, state.critical.draggable.id, state.impact);
      }

      if (state.phase === 'DROP_ANIMATING') {
        if (state.pending.result.draggableId === ownProps.draggableId) {
          return null;
        }

        return getSecondaryMovement(ownProps.draggableId, state.pending.result.draggableId, state.pending.impact);
      }

      return null;
    };

    var selector = function selector(state, ownProps) {
      return draggingSelector(state, ownProps) || secondarySelector(state, ownProps) || defaultMapProps$1;
    };

    return selector;
  };
  var mapDispatchToProps = {
    lift: lift,
    move: move,
    moveUp: moveUp,
    moveDown: moveDown,
    moveLeft: moveLeft,
    moveRight: moveRight,
    moveByWindowScroll: moveByWindowScroll,
    drop: drop,
    dropAnimationFinished: dropAnimationFinished
  };
  var defaultProps$1 = {
    isDragDisabled: false,
    disableInteractiveElementBlocking: false
  };
  var ConnectedDraggable = connect(makeMapStateToProps$1, mapDispatchToProps, null, {
    storeKey: storeKey,
    pure: true,
    areStatePropsEqual: isStrictEqual
  })(Draggable);
  ConnectedDraggable.defaultProps = defaultProps$1;

  exports.DragDropContext = DragDropContext;
  exports.Droppable = ConnectedDroppable;
  exports.Draggable = ConnectedDraggable;
  exports.resetServerContext = resetServerContext;

  Object.defineProperty(exports, '__esModule', { value: true });
}));
