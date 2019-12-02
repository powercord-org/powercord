const { React } = require('powercord/webpack');

const Header = require('./parts/Product/Header');
const Preview = require('./parts/Product/Preview');
const Permissions = require('./parts/Permissions');
const Rating = require('./parts/Rating');
const Tags = require('./parts/Tags');
const Footer = require('./parts/Product/Footer');

module.exports = class Product extends React.Component {
  render () {
    const { product: { manifest } } = this.props;
    return <>
      {this.props.type === 'themes' &&
        <Preview previews={manifest.previews || this.props.previews} />
      }

      <Header
        name={manifest.name}
        description={manifest.description}
      />

      {this.props.type === 'plugins' && (manifest.permissions || []).length > 0 &&
        <Permissions permissions={manifest.permissions}/>
      }

      <Rating
        rating={[ 110, 1 ]}
      />

      <Tags
        tags={manifest.tags || [ 'Cute', 'owo', 'whats', 'this' ]}
        nsfw={manifest.nsfw || true}
      />

      <Footer/>
    </>;
  }
};
