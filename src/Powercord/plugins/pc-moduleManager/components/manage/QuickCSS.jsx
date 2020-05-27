const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem, SliderInput } = require('powercord/components/settings');
const { AsyncComponent, Clickable, FormTitle, Tooltip, Icons: { Pin, Unpin, Gear, Close, ExternalLink } } = require('powercord/components');
const CodeMirror = require('./CodeMirror');

const VerticalScroller = AsyncComponent.from(getModuleByDisplayName('VerticalScroller'));

class QuickCSS extends React.PureComponent {
  constructor () {
    super();
    this.state = {
      cmSettings: false,
      cm: null
    };
    this.ref = React.createRef();
    this._handleCodeMirrorUpdate = global._.debounce(this._handleCodeMirrorUpdate.bind(this), 300);
    this._saveResizeHeight = global._.debounce(this._saveResizeHeight.bind(this), 500);
    this._handleResizeBegin = this._handleResizeBegin.bind(this);
    this._handleResizeEnd = this._handleResizeEnd.bind(this);
    this._handleResizeMove = this._handleResizeMove.bind(this);
  }

  componentWillUnmount () { // Just to be sure
    window.removeEventListener('mousemove', this._handleResizeMove);
    window.removeEventListener('mouseup', this._handleResizeEnd);
  }

  render () {
    return (
      <div
        className={[ 'powercord-quickcss', this.props.popout && 'popout', !this.props.popout && this.props.guestWindow && 'popped-out' ].filter(Boolean).join(' ')}
        style={{ '--editor-height': `${this.props.getSetting('cm-height', 350)}px` }}
        ref={this.ref}
      >
        {!this.props.popout && this.props.guestWindow
          ? <div className='powercord-quickcss-popped'>{Messages.POWERCORD_QUICKCSS_POPPED_OUT}</div>
          : <>
            <div className='powercord-quickcss-header'>
              <Tooltip text={Messages.SETTINGS} position='right'>
                <Clickable onClick={() => this.setState({ cmSettings: true })} className='button'>
                  <Gear/>
                </Clickable>
              </Tooltip>
              <div>
                {this.props.popout &&
                <Tooltip
                  text={this.props.windowOnTop ? Messages.POPOUT_REMOVE_FROM_TOP : Messages.POPOUT_STAY_ON_TOP}
                  position='left'
                >
                  <Clickable
                    onClick={async () => {
                      const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
                      popoutModule.setAlwaysOnTop('DISCORD_POWERCORD_QUICKCSS', !this.props.windowOnTop);
                    }}
                    className='button'
                  >
                    {this.props.windowOnTop ? <Unpin/> : <Pin/>}
                  </Clickable>
                </Tooltip>}
                <Tooltip text={this.props.popout ? Messages.CLOSE_WINDOW : Messages.POPOUT_PLAYER} position='left'>
                  <Clickable
                    onClick={() => this.props.popout
                      ? getModule([ 'setAlwaysOnTop', 'open' ], false).close('DISCORD_POWERCORD_QUICKCSS')
                      : this.props.openPopout()}
                    className='button'
                  >
                    {this.props.popout ? <Close/> : <ExternalLink/>}
                  </Clickable>
                </Tooltip>
              </div>
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
              <span>{Messages.POWERCORD_QUICKCSS_AUTOCOMPLETE}</span>
              <span>CodeMirror v{require('codemirror').version}</span>
            </div>
            {!this.props.popout && <div className='powercord-quickcss-resizer' onMouseDown={this._handleResizeBegin}/>}
          </>}
      </div>
    );
  }

  renderSettings () {
    const { getSetting, updateSetting, toggleSetting } = this.props;

    return (
      <VerticalScroller outerClassName='powercord-quickcss-editor-settings' theme='themeGhostHairline-DBD-2d' fade>
        <FormTitle tag='h2'>{Messages.POWERCORD_QUICKCSS_SETTINGS}</FormTitle>
        <div className='close-wrapper'>
          <Tooltip text={Messages.CLOSE} position='left'>
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
            {Messages.POWERCORD_QUICKCSS_SETTINGS_LINES}
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
            {Messages.POWERCORD_QUICKCSS_SETTINGS_FOLDING}
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-matchBrackets', true)}
            note={Messages.POWERCORD_QUICKCSS_SETTINGS_MATCH_BRACKETS_DESC}
            onChange={v => {
              toggleSetting('cm-matchBrackets', true);
              this.state.cm.setOption('matchBrackets', v.target.checked);
            }}
          >
            {Messages.POWERCORD_QUICKCSS_SETTINGS_MATCH_BRACKETS}
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-closeBrackets', true)}
            note={Messages.POWERCORD_QUICKCSS_SETTINGS_CLOSE_BRACKETS_DESC}
            onChange={v => {
              toggleSetting('cm-closeBrackets', true);
              this.state.cm.setOption('autoCloseBrackets', v.target.checked);
            }}
          >
            {Messages.POWERCORD_QUICKCSS_SETTINGS_CLOSE_BRACKETS}
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-wrap', false)}
            onChange={v => {
              toggleSetting('cm-wrap', false);
              this.state.cm.setOption('lineWrapping', v.target.checked);
            }}
          >
            {Messages.POWERCORD_QUICKCSS_SETTINGS_WRAP}
          </SwitchItem>
          <SwitchItem
            value={getSetting('cm-tabs', false)}
            onChange={v => {
              toggleSetting('cm-tabs', false);
              this.state.cm.setOption('indentWithTabs', v.target.checked);
            }}
          >
            {Messages.POWERCORD_QUICKCSS_SETTINGS_TABS}
          </SwitchItem>
          <SliderInput
            disabled={this.props.popout}
            note={this.props.popout && Messages.POWERCORD_QUICKCSS_SETTINGS_INDENT_WARNING}
            stickToMarkers
            initialValue={4}
            markers={[ 2, 4, 8 ]}
            onMarkerRender={s => `${s} spaces`}
            defaultValue={getSetting('cm-indentSize', 2)}
            onValueChange={v => {
              updateSetting('cm-indentSize', v);
              this.state.cm.setOption('tabSize', v);
              this.state.cm.setOption('indentUnit', v);
            }}
          >
            {Messages.POWERCORD_QUICKCSS_SETTINGS_INDENT}
          </SliderInput>
        </div>
      </VerticalScroller>
    );
  }

  setupCodeMirror (cm) {
    cm.on('change', this._handleCodeMirrorUpdate);
    cm.setValue(powercord.pluginManager.get('pc-moduleManager')._quickCSS);
    if (this.props.popout) {
      setTimeout(() => cm.refresh(), 100);
    }
    this.setState({ cm });
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
    this.props.updateSetting('cm-height', height);
  }
}

module.exports = AsyncComponent.from((async () => {
  const windowStore = await getModule([ 'getWindow' ]);
  return Flux.connectStores([ windowStore, powercord.api.settings.store ], () => ({
    guestWindow: windowStore.getWindow('DISCORD_POWERCORD_QUICKCSS'),
    windowOnTop: windowStore.getIsAlwaysOnTop('DISCORD_POWERCORD_QUICKCSS'),
    ...powercord.api.settings._fluxProps('pc-moduleManager')
  }))(QuickCSS);
})());
