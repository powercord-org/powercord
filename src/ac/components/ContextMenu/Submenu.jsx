const { React } = require('ac/webpack');
const Button = require('./Button.jsx');
const Slider = require('./Slider.jsx');

class SubmenuItem extends React.Component {
  constructor () {
    super();

    this.state = {
      hovered: false,
      items: [],
      coords: {
        x: 0,
        y: 0
      }
    };
  }

  onEnter (event) {
    const { x, y } = event.target.getBoundingClientRect();
    this.setState({
      hovered: true,
      coords: { x, y }
    });
  }

  onLeave (ev) {
    this.setState({
      hovered: false
    });
  }

  async componentDidMount () {
    this.setState({
      items: await this.props.item.getItems()
    })
  }

  render () {
    return (
      <div class='item-1Yvehc itemSubMenu-1vN_Yn itemSubMenuHasScroller-1J2hmF' onMouseEnter={this.onEnter.bind(this)} onMouseLeave={this.onLeave.bind(this)}>
        {this.props.item.name}
        {
          this.state.hovered && this.state.items[0]
            ? this.getSubContextMenu()
            : <div />
        }
      </div>
    );
  }

  getSubContextMenu () {
    return (
      <div class='contextMenu-HLZMGh theme-dark' style={{
        left: this.state.coords.x,
        top: this.state.coords.y,
        width: '205px'
      }}>
        {
          this.state.items.map(item => {
            switch (item.type) {
              case 'button':
                return <Button item={item} />
              
              case 'slider':
                return <Slider item={item} />

              case 'submenu':
                return <Submenu item={item} />
            }
          })
        }
      </div>
    )
  }
}

module.exports = SubmenuItem;

/*

bottom: 661
height: 28
left: 252
right: 422
top: 633
width: 170
x: 252
y: 633


              type: 'submenu',
              name: 'Devices',
              children: [{
                type: 'button',
                name: 'a'
              }, {
                type: 'button',
                name: 'a'
              }]*/