const { React } = require('ac/webpack');
const Slider = require('./Slider.jsx');
const Button = require('./Button.jsx');
const Submenu = require('./Submenu.jsx');

module.exports = class ContextMenu extends React.Component {
  componentDidMount () {
    console.log('mounted');
  }
  
  render () {
    console.log('rendered');
    return (
      <div class='contextMenu-HLZMGh theme-dark' style={{
        bottom: `${screen.height - this.props.pageY}px`,
        left: `${this.props.pageX}px`
      }}>
        {this.props.itemGroups.map(items => (
          <div class='itemGroup-1tL0uz'>
            {items.map(item => {
              switch (item.type) {
                case 'slider':
                  return <Slider item={item} />;
                
                case 'button':
                  return <Button item={item} />

                case 'submenu':
                  return <Submenu item={item} />
              }
            })}
          </div>
        ))}
      </div>
    )
  }
}