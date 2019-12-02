const { React, getModule } = require('powercord/webpack');

const Header = require('./parts/Product/Header');
const Preview = require('./parts/Product/Preview');
const Permissions = require('./parts/Permissions');
const Rating = require('./parts/Product/Rating');
const Tags = require('./parts/Product/Tags');
const Footer = require('./parts/Product/Footer');

module.exports = class Product extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      classes: {},
      loaded: false
    };
  }

  async componentDidMount () {
    this.setState({
      classes: { ...await getModule([ 'card', 'loaded' ]) }
    });
  }

  render () {
    const { classes } = this.state;
    const { product: { manifest } } = this.props;
    return <>
      <div className={[ this.props.className, this.state.loaded ? classes.loaded : classes.loading ].join(' ')}>
        <div className={classes.card} onLoad={() => this.setState({ loaded: true })}>
          {this.props.type === 'themes' &&
            <Preview previews={manifest.previews || this.props.previews} />
          }

          <Header
            name={manifest.name}
            description={manifest.description}
            verified={true}
          />

          {this.props.type === 'plugins' && (manifest.permissions || []).length > 0 &&
            <Permissions permissions={manifest.permissions}/>
          }

          <Rating
            votes={{
              up: 110,
              down: 1
            }}
          />

          <Tags
            tags={manifest.tags || [ 'Cute', 'owo', 'whats', 'this' ]}
            nsfw={manifest.nsfw || true}
          />

          <Footer/>
        </div>
      </div>
    </>;
  }
};
