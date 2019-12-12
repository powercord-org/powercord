const { React, getModuleByDisplayName } = require('powercord/webpack');
const { Card, AsyncComponent } = require('powercord/components');
const { Modal } = require('powercord/components/modal');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));

// @todo: move this to i18n
const Strings = {
  COMMERCIAL_USE: {
    name: 'Commercial use',
    desc: 'This software and derivatives may be used for commercial purposes.'
  },
  MODIFICATIONS: {
    name: 'Modification',
    desc: 'This software may be modified.'
  },
  DISTRIBUTION: {
    name: 'Distribution',
    desc: 'This software may be distributed.'
  },
  PATENT_USE: {
    name: 'Patent use',
    permissions: 'This license provides an express grant of patent rights from contributors.',
    limitations: 'This license explicitly states that it does NOT grant any rights in the patents of contributors.'
  },
  PRIVATE_USE: {
    name: 'Private use',
    desc: 'This software may be used and modified in private.'
  },
  INCLUDE_COPYRIGHT: {
    name: 'License and copyright notice',
    desc: 'A copy of the license and copyright notice must be included with the software.'
  },
  DISCLOSE_SOURCE: {
    name: 'Disclose source',
    desc: 'Source code must be made available when the software is distributed.'
  },
  DOCUMENT_CHANGES: {
    name: 'State changes',
    desc: 'Changes made to the code must be documented.'
  },
  NETWORK_USE_DISCLOSE: {
    name: 'Network use is distribution',
    desc: 'Users who interact with the software via network are given the right to receive a copy of the source code.'
  },
  SAME_LICENSE: {
    name: 'Same license',
    desc: 'Modifications must be released under the same license when distributing the software. In some cases a similar or related license may be used.'
  },
  LIABILITY: {
    name: 'Liability',
    desc: 'This license includes a limitation of liability.'
  },
  TRADEMARK_USE: {
    name: 'Trademark use',
    desc: 'This license explicitly states that it does NOT grant trademark rights, even though licenses without such a statement probably do not grant any implicit trademark rights.'
  },
  WARRANTY: {
    name: 'Warranty',
    desc: 'The license explicitly states that it does NOT provide any warranty.'
  }
};

module.exports = ({ license: { name, description, url, permissions, conditions, limitations } }) => {
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
      <p className='powercord-entities-license-desc'>{description}</p>
      <Card className='powercord-entities-license-card'>
        This is not legal advice. Data from <a target='_blank' href={url}>choosealicense.com</a>.
      </Card>
      {[ 'permissions', 'limitations', 'conditions' ].map(type =>
        <div className={`powercord-entities-license-data ${type}`}>
          <FormTitle tag='h4'>{type}</FormTitle>
          {data[type].map(perm => <div key={perm} className='powercord-entities-license-entry'>
            <span>{Strings[perm].name}</span>
            <div>{Strings[perm][type] || Strings[perm].desc}</div>
          </div>)}
        </div>
      )}
    </Modal.Content>
  </Modal>;
};
