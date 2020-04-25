const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { SwitchItem, SliderInput } = require('powercord/components/settings');
const { AsyncComponent, PopoutWindow, Clickable, FormTitle, Tooltip, Icons: { Gear, Close, ExternalLink } } = require('powercord/components');
const CodeMirror = require('./CodeMirror');

const VerticalScroller = AsyncComponent.from(getModuleByDisplayName('VerticalScroller'));

class QuickCSS extends React.PureComponent {
  constructor () {
    super();
    this.state = {
      cmSettings: false,
      poppedOut: false,
      cm: null,
      win: null
    };
    this.ref = React.createRef();
    this._handleCodeMirrorUpdate = global._.debounce(this._handleCodeMirrorUpdate.bind(this), 300);
    this._saveResizeHeight = global._.debounce(this._saveResizeHeight.bind(this), 1500);
    this._handleResizeBegin = this._handleResizeBegin.bind(this);
    this._handleResizeEnd = this._handleResizeEnd.bind(this);
    this._handleResizeMove = this._handleResizeMove.bind(this);
  }

  async componentDidMount () {
    const windowManager = await getModule([ 'getWindow' ]);
    const guestWindow = windowManager.getWindow('DISCORD_POWERCORD_QUICKCSS');
    if (guestWindow) {
      if (!this.props.popout) {
        this.setState({ poppedOut: true });
        guestWindow.addEventListener('beforeunload', () => {
          this.setState({ poppedOut: false });
        });
      } else {
        this.setState({ win: guestWindow });
        setTimeout(() => this.state.cm.refresh(), 100);

        // Pass CSS to child window
        const style = document.querySelector('#powercord-css-pc-moduleManager').outerHTML;
        guestWindow.document.head.innerHTML += style;
      }
    }
  }

  componentWillUnmount () { // Just to be sure
    window.removeEventListener('mousemove', this._handleResizeMove);
    window.removeEventListener('mouseup', this._handleResizeEnd);
  }

  render () {
    return (
      <div
        className={[ 'powercord-quickcss', this.props.popout && 'popout' ].filter(Boolean).join(' ')}
        style={{ '--editor-height': `${this.props.getSetting('cm-height', 350)}px` }}
        ref={this.ref}
      >
        {this.state.poppedOut
          ? <div className='powercord-quickcss-popped'>Editor popped out</div>
          : <>
            <div className='powercord-quickcss-header'>
              <Tooltip text='Settings' position='right'>
                <Clickable onClick={() => this.setState({ cmSettings: true })} className='button'>
                  <Gear/>
                </Clickable>
              </Tooltip>
              <Tooltip text={this.props.popout ? 'Close popout' : 'Popout'} position='left'>
                <Clickable
                  onClick={() => this.props.popout ? this.state.win.close() : this._openPopout()}
                  className='button'
                >
                  {this.props.popout ? <Close/> : <ExternalLink/>}
                </Clickable>
              </Tooltip>
            </div>
            <div className='powercord-quickcss-editor'>
              {this.state.cmSettings && this.renderSettings()}
              <CodeMirror
                popout={this.props.popout}
                onReady={this.setupCodeMirror.bind(this)}
                getSetting={this.props.getSetting}
              />
            </div>
            <div className='powercord-quickcss-footer'>
              <span>Ctrl+Space for autocomplete</span>
              <span>CodeMirror v{require('codemirror').version}</span>
            </div>
            {!this.props.popout && <div className='powercord-quickcss-resizer' onMouseDown={this._handleResizeBegin}/>}
          </>}
      </div>
    );
  }

  renderSettings () {
    const { getSetting, setSetting, toggleSetting } = this.props;

    return (
      <VerticalScroller outerClassName='powercord-quickcss-editor-settings' theme='themeGhostHairline-DBD-2d' fade>
        <FormTitle tag='h2'>CodeMirror Settings</FormTitle>
        <div className='close-wrapper'>
          <Tooltip text='Close' position='left'>
            <Clickable onClick={() => this.setState({ cmSettings: false })} className='close'>
              <Close/>
            </Clickable>
          </Tooltip>
        </div>
        <div>
          <SwitchItem
            value={getSetting('cm-lineNumbers', true)}
            onChange={v => {
              toggleSetting('cm-lineNumbers', true);
              this.state.cm.setOption('lineNumbers', v.target.checked);
            }}
          >
            Show line numbers
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-codeFolding', true)}
            onChange={v => {
              toggleSetting('cm-codeFolding', true);
              if (!v.target.checked) {
                this.state.cm.execCommand('unfoldAll');
              }
              this.state.cm.setOption('foldGutter', v.target.checked);
            }}
          >
            Enable code folding
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-matchBrackets', true)}
            note='Will highlight matching brackets whenever the cursor is next to them.'
            onChange={v => {
              toggleSetting('cm-matchBrackets', true);
              this.state.cm.setOption('matchBrackets', v.target.checked);
            }}
          >
            Match brackets
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-closeBrackets', true)}
            note='Will auto-close brackets and quotes when typed.'
            onChange={v => {
              toggleSetting('cm-closeBrackets', true);
              this.state.cm.setOption('autoCloseBrackets', v.target.checked);
            }}
          >
            Auto-close brackets
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-wrap', false)}
            onChange={v => {
              toggleSetting('cm-wrap', false);
              this.state.cm.setOption('lineWrapping', v.target.checked);
            }}
          >
            Wrap long lines
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-tabs', false)}
            onChange={v => {
              toggleSetting('cm-tabs', false);
              this.state.cm.setOption('indentWithTabs', v.target.checked);
            }}
          >
            Use tabs for indentation
          </SwitchItem>
          <SliderInput
            stickToMarkers
            initialValue={4}
            markers={[ 2, 4, 8 ]}
            onMarkerRender={s => `${s} spaces`}
            defaultValue={getSetting('cm-indentSize', 2)}
            onChange={v => {
              setSetting('cm-indentSize', v);
              this.state.cm.setOption('tabSize', v);
              this.state.cm.setOption('indentUnit', v);
            }}
          >
            Indentation size
          </SliderInput>
        </div>
      </VerticalScroller>
    );
  }

  setupCodeMirror (cm) {
    cm.on('change', this._handleCodeMirrorUpdate);
    cm.setValue(powercord.pluginManager.get('pc-moduleManager')._quickCSS);
    this.setState({ cm });
  }

  async _openPopout () {
    const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
    popoutModule.open('DISCORD_POWERCORD_QUICKCSS', () =>
      React.createElement(PopoutWindow, { windowId: 'DISCORD_POWERCORD_QUICKCSS' },
        React.createElement(QuickCSS, {
          ...this.props,
          popout: true
        })
      )
    );
    popoutModule.setAlwaysOnTop('DISCORD_POWERCORD_QUICKCSS', true);
    setImmediate(async () => {
      const windowManager = await getModule([ 'getWindow' ]);
      const guestWindow = windowManager.getWindow('DISCORD_POWERCORD_QUICKCSS');
      this.setState({ poppedOut: true });
      guestWindow.addEventListener('beforeunload', () => {
        this.setState({ poppedOut: false });
      });
    });
  }

  _handleCodeMirrorUpdate (cm) {
    // noinspection JSIgnoredPromiseFromCall
    powercord.pluginManager.get('pc-moduleManager')._saveQuickCSS(cm.getValue());
  }


  _handleResizeBegin () {
    window.addEventListener('mousemove', this._handleResizeMove);
    window.addEventListener('mouseup', this._handleResizeEnd);
  }

  _handleResizeEnd () {
    window.removeEventListener('mousemove', this._handleResizeMove);
    window.removeEventListener('mouseup', this._handleResizeEnd);
  }

  _handleResizeMove (e) {
    const height = e.clientY - this.ref.current.getBoundingClientRect().y;
    this.ref.current.setAttribute('style', `--editor-height: ${height}px`);
    this._saveResizeHeight(height);
  }

  _saveResizeHeight (height) {
    this.props.setSetting('cm-height', height);
  }
}

module.exports = QuickCSS;
