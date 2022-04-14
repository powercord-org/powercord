const { React, Router } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
// eslint-disable-next-line no-unused-vars
const { get } = require('powercord/http');

const StoreListing = require('./StoreListing');
const Suggestions = require('./Suggestions');
const Form = require('./Form');
const PublishIntro = require('./Publish/Intro');
const PublishForm = require('./Publish/Form');
const VerificationIntro = require('./Verification/Intro');
const VerificationForm = require('./Verification/Form');
const HostingIntro = require('./Hosting/Intro');
const HostingForm = require('./Hosting/Form');

module.exports = function () {
  // dont touch mah stuff :angery:
  const ids = [
    'fC7oUOUEEi4', 'h6DNdop6pD8', 'LDU_Txk06tM', 'Gc2u6AFImn8', 'Nl_Tj82asR4', '7Zm1hPbmzPw', 'qnydFmqHuVo',
    'ull5YaEHvw0', 'Yuc2dkr8d-A', 'L_jWHffIx5E', 'q4OItmKWFKw', 'NHEaYbDWyQE', 'eEa3vDXatXg', 'TwIvUbOhcKE',
    'jhExvE5fvJw', 'oT3mCybbhf0', 'woe2tvl2caw', 'LJxxHDTz8J4', 'ohBQ59OXnYM', '8qMs7mfRm-k', 'w0AOGeqOnFY',
    'npjF032TDDQ', 'QH2-TGUlwu4', 'Ct6BUPvE2sM', 'ZyhrYis509A', 'PDJLvF1dUek', 'Wl959QnD3lM', 'GegN_AXWWqc'
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 'calc(100% + 240px)',
      height: '100%',
      marginLeft: -240,
      zIndex: 666
    }}>
      <iframe
        width='100%' height='100%'
        src={`https://www.youtube.com/embed/${ids[Math.floor(Math.random() * ids.length)]}?autoplay=1`}
        frameBorder='0' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
        allowFullScreen
      />
    </div>
  );

  /* eslint-disable */
  const [ eligibility, setEligibility ] = React.useState(null)
  React.useEffect(() => {
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    // get(`${baseUrl}/api/v2/store/forms/eligibility`).then(res => res.ok && setEligibility(res.body))
  }, [])

  return (
    <Router.Switch>
      <Router.Route path='/_powercord/store/plugins' exact>
        <StoreListing type='plugins'/>
      </Router.Route>
      <Router.Route path='/_powercord/store/themes' exact>
        <StoreListing type='themes'/>
      </Router.Route>
      <Router.Route path='/_powercord/store/suggestions' exact>
        <Suggestions/>
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/publish' exact>
        <Form
          key='publish'
          icon='CloudUpload'
          title='Publish a product'
          eligibility={eligibility ? eligibility.publish : true}
          renderIntro={() => <PublishIntro/>}
          renderForm={() => <PublishForm/>}
        />
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/verificaton' exact>
        <Form
          key='verificaton'
          icon='Verified'
          title='Get verified'
          eligibility={eligibility ? eligibility.verificaton : true}
          renderIntro={() => <VerificationIntro/>}
          renderForm={() => <VerificationForm/>}
        />
      </Router.Route>
      <Router.Route path='/_powercord/store/forms/hosting' exact>
        <Form
          key='hosting'
          icon='Server'
          title='Host a backend'
          eligibility={eligibility ? eligibility.hosting : true}
          renderIntro={() => <HostingIntro/>}
          renderForm={() => <HostingForm/>}
        />
      </Router.Route>
      <Router.Route path='/_powercord/store' exact>
        <Router.Redirect path='/_powercord/store/plugins'/>
      </Router.Route>
    </Router.Switch>
  );
};
