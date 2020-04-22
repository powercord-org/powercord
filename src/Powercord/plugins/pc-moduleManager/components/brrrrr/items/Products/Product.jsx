const { React, getModule } = require('powercord/webpack');

const Header = require('./parts/Product/Header');
const Preview = require('./parts/Product/Preview');
const Permissions = require('./parts/Permissions');
const Rating = require('./parts/Product/Rating');
const Tags = require('./parts/Product/Tags');
const Footer = require('./parts/Product/Footer');

let classes = null;
setImmediate(async () => classes = await getModule([ 'card', 'loaded' ]));

module.exports = class Product extends React.Component {
  render () {
    // @todo: proper data structure
    const { product: { manifest } } = this.props;
    return <div className='powercord-product'>
      <div className={classes.card}>
        <div className='powercord-product-abandonware'>Discontinued</div>
        {(1 !== 2) && <Preview previews={[
          'https://i.bowser65.xyz/e3c67734c8.jpg',
          'https://i.bowser65.xyz/3356e6506c.jpg',
          'https://i.bowser65.xyz/520ea675ae.jpg',
          'https://i.bowser65.xyz/915a2b6995.jpg',
          'https://i.bowser65.xyz/128904cc6a.jpg'
        ]}/>}
        <Header name={manifest.name} verified={true}/>
        {/* @todo metadata */}
        <div className='powercord-product-description'>{manifest.description}</div>
        {(manifest.permissions || []).length > 0 && <Permissions svgSize={18} permissions={manifest.permissions}/>}
        <Rating up={1337} down={69} self={null} onVote={(type) => console.log(type)}/>
        {(manifest.tags || true) && <Tags tags={manifest.tags || [ 'test', 'tags', 'yes' ]}/>}
        <Footer/>
      </div>
    </div>;
  }
};
