const { React, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Card, AsyncComponent } = require('powercord/components');
const { Modal } = require('powercord/components/modal');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));

module.exports = ({ spdx, license: { name, url, permissions, conditions, limitations } }) => {
  const data = {
    permissions,
    conditions,
    limitations
  };

  return <Modal
    className='powercord-text powercord-entities-license'
    _pass={{ ref: s => setImmediate(() => s && s.getScroller() && s.getScroller().scrollTo(0)) }}
  >
    <Modal.Header>
      <FormTitle tag='h4'>{name}</FormTitle>
    </Modal.Header>
    <Modal.Content>
      <p className='powercord-entities-license-desc'>{Messages[`POWERCORD_PLUGINS_LICENSE_DESC_${spdx}`]}</p>
      <Card className='powercord-entities-license-card'>
        {Messages.POWERCORD_PLUGINS_LICENSE_DISCLAIMER.format({ url })}
      </Card>
      {[ 'permissions', 'limitations', 'conditions' ].map(type =>
        <div className={`powercord-entities-license-data ${type}`}>
          <FormTitle tag='h4'>{Messages[`POWERCORD_PLUGINS_LICENSE_${type.toUpperCase()}`]}</FormTitle>
          {data[type].map(perm => <div key={perm} className='powercord-entities-license-entry'>
            <span>{Messages[`POWERCORD_PLUGINS_LICENSE_${perm}_NAME`]}</span>
            <div>{perm === 'PATENT_USE'
              ? type === 'permissions'
                ? Messages.POWERCORD_PLUGINS_LICENSE_PATENT_USE_DESC_ALLOWED
                : Messages.POWERCORD_PLUGINS_LICENSE_PATENT_USE_DESC_FORBIDDEN
              : Messages[`POWERCORD_PLUGINS_LICENSE_${perm}_DESC`]}</div>
          </div>)}
        </div>
      )}
    </Modal.Content>
  </Modal>;
};
