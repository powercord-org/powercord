const { React, getModule } = require('powercord/webpack');
const { TabBar } = require('powercord/components');
const Base = require('./Base');

class Themes extends Base {
  constructor () {
    super();
    this.state.tab = 'INSTALLED';
  }

  render () {
    const { topPill, item } = getModule([ 'topPill' ], false);
    return (
      <>
        <div className='powercord-entities-manage-tabs'>
          <TabBar
            selectedItem={this.state.tab}
            onItemSelect={tab => this.setState({ tab })}
            type={topPill}
          >
            <TabBar.Item className={item} selectedItem={this.state.tab} id='INSTALLED'>Manage</TabBar.Item>
            <TabBar.Item className={item} selectedItem={this.state.tab} id='QUICK_CSS'>Quick CSS</TabBar.Item>
          </TabBar>
        </div>
        {this.state.tab === 'INSTALLED' ? super.render() : this.renderQuickCSS()}
      </>
    );
  }

  renderQuickCSS () {
    return 'yes';
  }

  renderItem (item) {
    console.log(item);
    return 'mhm';
  }

  getItems () {
    return this._sortItems([ ...powercord.styleManager.themes.values() ].filter(t => t.isTheme));
  }
}

module.exports = Themes;
