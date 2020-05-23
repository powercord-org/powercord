const { React, i18n: { Messages } } = require('powercord/webpack');
const { Card, Tooltip, Switch } = require('powercord/components');

const BaseProduct = require('./BaseProduct');

class InstalledProduct extends BaseProduct {
  render () {
    return (
      <Card className='powercord-product'>
        {this.renderHeader()}
        {this.renderDetails()}
        {this.renderPermissions()}
        {this.renderFooter()}
      </Card>
    );
  }

  renderHeader () {
    return (
      <div className='powercord-product-header'>
        <h4>{this.props.product.name}</h4>
        <Tooltip text={this.props.enabled ? Messages.DISABLE : Messages.ENABLE} position='top'>
          <div>
            <Switch value={this.props.enabled} onChange={v => this.props.onToggle(v.target.checked)}/>
          </div>
        </Tooltip>
      </div>
    );
  }
}

module.exports = InstalledProduct;
