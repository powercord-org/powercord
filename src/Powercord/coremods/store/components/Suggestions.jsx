const { shell: { openExternal } } = require('electron');
const { React, getModule } = require('powercord/webpack');
const { Clickable, ErrorState } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');

const StoreWrapper = require('./StoreWrapper');
const CardsContainer = require('./CardsContainer');

const States = Object.freeze({
  LOADING: 'LOADING',
  ERRORED: 'ERRORED',
  LOADED: 'LOADED'
});

module.exports = React.memo(
  () => {
    const { size16, size14, size12 } = getModule([ 'size16' ], false);
    const { marginBottom20 } = getModule([ 'marginBottom20' ], false);
    const { colorHeaderPrimary, colorHeaderSecondary } = getModule([ 'colorHeaderPrimary' ], false);
    const { card, title, guildName, description, memberInfo, memberCount, dotOnline, dotOffline } = getModule([ 'card', 'guildBadge' ], false);
    const { replyAvatar } = getModule([ 'replyAvatar' ], false);

    const [ search, setSearch ] = React.useState(null);
    const [ suggestions, setSuggestions ] = React.useState({ state: States.LOADING });
    const filteredSuggestions = React.useMemo(
      () => suggestions.items && suggestions.items.filter(s => !search || s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search)),
      [ suggestions, search ]
    );
    React.useEffect(() => {
      const baseUrl = powercord.settings.get('backendURL', WEBSITE);
      get(`${baseUrl}/api/v2/store/suggestions`).then(res => {
        if (!res.ok) {
          return setSuggestions({ state: States.ERRORED });
        }

        setSuggestions({
          state: States.LOADED,
          items: res.body
        });
      });
    }, []);

    return (
      <StoreWrapper
        catchLine='Get inspiration for your next plugin'
        subtext={'Browse all community-requested plugins and make people happier. It\'s free!'}
        placeholder='Explore suggestions'
        onSearch={s => setSearch(s && s.toLowerCase())}
        footerText={'You have a great idea that isn\'t listed here?'}
        footerLink={'Suggest it!'}
        // @todo: dynamic link
        footerAction={() => openExternal('https://github.com/powercord-community/suggestions/issues/new?assignees=&labels=pending+review&template=plugin_request.md&title=')}
        noFooter={filteredSuggestions && filteredSuggestions.length === 0}
      >
        {suggestions.state === States.ERRORED && <ErrorState>Failed to load suggestions.</ErrorState>}
        <div className={`${size16} ${marginBottom20}`}>
          Suggestions listed here are from submissions on our <a href='https://github.com/powercord-community/suggestions' target='_blank'>suggestions repository</a>.
          If you really like an idea, click on it to see the original issue on GitHub and add a 👍 reaction! (You'll need a GitHub account).
        </div>
        <CardsContainer loading={suggestions.state !== States.LOADED}>
          {filteredSuggestions && filteredSuggestions.map(s => (
            <Clickable key={s.id} className={card} onClick={() => openExternal(`https://github.com/powercord-community/suggestions/issues/${s.id}`)}>
              <div className='powercord-store-suggestion'>
                <div className={title}>
                  <div className={`${colorHeaderPrimary} ${size16} ${guildName}`}>{s.title}</div>
                </div>
                <div className={`${colorHeaderSecondary} ${size16}`}>
                by <img alt='' src={s.author ? s.author.avatarUrl : '/assets/f78426a064bc9dd24847519259bc42af.png'} className={replyAvatar}/> {s.author ? s.author.login : 'A ghost'}
                </div>
                <div className={`${colorHeaderSecondary} ${size14} ${description}`}>
                  {s.description}
                </div>
                <div className={memberInfo}>
                  <div className={memberCount}>
                    <div className={dotOffline}/>
                    {/* upvote(s) will get pluralized properly once this uses the i18n engine */}
                    <div className={`${colorHeaderSecondary} ${size12}`}>{s.upvotes} upvotes</div>
                  </div>
                  {s.wip && <div className={memberCount}>
                    <div className={dotOnline}/>
                    <div className={`${colorHeaderSecondary} ${size12}`}>Someone's working on it!</div>
                  </div>}
                </div>
              </div>
            </Clickable>
          ))}
        </CardsContainer>
      </StoreWrapper>
    );
  }
);
