const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Mask } = require('powercord/components');

const CarouselWithSlide = AsyncComponent.from(getModuleByDisplayName('CarouselWithSlide'));

module.exports = class Preview extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      classes: {}
    };
  }

  async componentDidMount () {
    this.setState({
      classes: { ...await getModule([ 'card', 'loaded' ]) }
    });
  }

  render () {
    const { classes } = this.state;
    return <>
      <div className='powercord-store-product-preview'>
        <CarouselWithSlide
          delay={3e4}
          items={[ ...Array(5) ].map(() => this.props.previews[0])}
          renderItem={(item) =>
            <div className={classes.splash}>
              <Mask mask={Mask.Masks.VERTICAL_FADE} width={308} height={144}>
                <img
                  src={item}
                  alt=''
                  className={classes.splashImage}
                />
              </Mask>
            </div>
          }
        />
      </div>
    </>;
  }
};
