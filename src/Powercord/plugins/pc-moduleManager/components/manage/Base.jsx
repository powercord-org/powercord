const { join } = require('path');
const { shell } = require('electron');
const { React, getModule, contextMenu } = require('powercord/webpack');
const { Button, ContextMenu, Divider, Icons: { Overflow } } = require('powercord/components');
const { TextInput } = require('powercord/components/settings');

class Base extends React.Component {
  constructor () {
    super();
    this.state = {
      search: ''
    };
  }

  render () {
    return (
      <div className='powercord-entities-manage powercord-text'>
        <div className='powercord-entities-manage-header'>
          {this.renderHeader()}
          {this.renderButtons()}
        </div>
        <Divider/>
        {this.renderBody()}
      </div>
    );
  }

  renderHeader () {
    return (
      <span>Installed {this.constructor.name}</span>
    );
  }

  renderButtons () {
    return (
      <div className='buttons'>
        <Button onClick={() => this.goToStore()}>Explore {this.constructor.name.slice(0, -1)} Store</Button>
        <Overflow onClick={e => this.openOverflowMenu(e)} onContextMenu={e => this.openOverflowMenu(e)}/>
      </div>
    );
  }

  renderBody () {
    return (
      <div className='powercord-entities-manage-items'>
        {this.renderSearch()}
        {this.getItems().map(item => this.renderItem(item))}
      </div>
    );
  }

  renderSearch () {
    return (
      <div className='powercord-entities-manage-search'>
        <TextInput
          value={this.state.search}
          onChange={search => this.setState({ search })}
          placeholder='What are you looking for?'
        >
          Search {this.constructor.name.toLowerCase()}...
        </TextInput>
      </div>
    );
  }

  renderItem () {
    return null;
  }

  getItems () {
    return [];
  }

  openOverflowMenu (e) {
    contextMenu.openContextMenu(e, () =>
      React.createElement(ContextMenu, {
        width: '50px',
        itemGroups: [ [
          {
            type: 'button',
            name: `Open ${this.constructor.name.toLowerCase()} folder`,
            onClick: () => shell.openItem(join(__dirname, '..', '..', '..', '..', this.constructor.name.toLowerCase()))
          },
          {
            type: 'button',
            name: `Find missing ${this.constructor.name.toLowerCase()}`,
            onClick: () => this.fetchMissing()
          }
        ] ]
      })
    );
  }

  async goToStore () {
    const { popLayer } = await getModule([ 'popLayer' ]);
    const { transitionTo } = await getModule([ 'transitionTo' ]);
    popLayer();
    transitionTo(`/_powercord/store/${this.constructor.name.toLowerCase()}`);
  }

  fetchMissing () {
    throw new Error('Not implemented');
  }

  _sortItems (items) {
    if (this.state.search !== '') {
      const search = this.state.search.toLowerCase();
      items = items.filter(p =>
        p.manifest.name.toLowerCase().includes(search) ||
        p.manifest.author.toLowerCase().includes(search) ||
        p.manifest.description.toLowerCase().includes(search)
      );
    }

    return items.sort((a, b) => {
      const nameA = a.manifest.name.toLowerCase();
      const nameB = b.manifest.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
  }
}

module.exports = Base;
