const { React, /* contextMenu, */ instance: { cache: moduleCache } } = require('powercord/webpack');
// const { Draggable } = window.ReactBeautifulDnd;

module.exports = class Folder extends React.Component {
  constructor () {
    super();

    this.wrapperClass = Object.values(moduleCache).filter(m => m.exports && m.exports.wrapper && Object.keys(m.exports).length === 1)[1].exports.wrapper;
    this.guildClasses = Object.values(moduleCache).filter(m => m.exports && m.exports./* downloadAppButton */dragPlaceholder)[0].exports;
  }

  render () {
    return <div className={`${this.guildClasses.container} pc-folder`}>
      <div className={`${this.wrapperClass} pc-guildInner`} onContextMenu={this.handleContextMenu.bind(this)}>
        <a href='#' onClick={e => e.preventDefault()}>
          <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 4 24 19'>
            <path
              fill={this.props.folder.icon === '' ? '#2f3136' : `url(#background${this.props.folder.id})`}
              d='M10.59 4.59C10.21 4.21 9.7 4 9.17 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-1.41-1.41z'
            />
            {this.props.folder.icon !== '' && <defs>
              <pattern id={`background${this.props.folder.id}`} patternUnits='userSpaceOnUse' width='24' height='24'>
                <image xlinkHref={this.props.folder.icon} x='0' y='0' width='24' height='24'/>
              </pattern>
            </defs>}
          </svg>
          {this.props.folder.icon === '' &&
          <span>{this.props.folder.name.replace(/\w+/g, e => e[0]).replace(/\s/g, '')}</span>}
        </a>
      </div>
      <div className='powercord-folder-contents'>

      </div>
    </div>;
  }

  handleContextMenu () {
    // @todo
  }
};
