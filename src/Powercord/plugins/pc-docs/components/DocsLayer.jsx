const { React, Flux, getModule, hljs } = require("powercord/webpack");
const { PopoutWindow, Spinner } = require("powercord/components");
const { WEBSITE } = require("powercord/constants");
const { get } = require("powercord/http");
const DocPage = require("./DocPage");
const SettingsView = require("./SettingsView");
const { markup } = getModule(["markup"]);

let sectionsCache = [
  {
    section: "loading",
    label: "Loading...",
    element: () => <Spinner />,
  },
];

class DocsLayer extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      sections: sectionsCache,
      section: "loading",
    };
  }

  async componentDidMount() {
    const baseUrl = powercord.settings.get("backendURL", WEBSITE);
    const sections = await get(`${baseUrl}/api/v2/docs/categories`).then(
      (res) => res.body
    );
    sectionsCache = [];
    sections.forEach((section) => {
      sectionsCache.push(
        { section: "DIVIDER" },
        {
          section: "HEADER",
          label: section.name,
        },
        ...section.docs
          .map((doc) => {
            const tab = {
              section: `${section.id}/${doc.id}`,
              label: doc.title,
              element: () => (
                <DocPage
                  doc={doc.id}
                  category={section.id}
                  modules={{ hljs, markup }}
                  setSection={(section) => this.setState({ section })}
                  onScrollTo={(part) => this.scrollTo(part)}
                />
              ),
            };
            return [
              tab,
              ...doc.parts.map((part) => ({
                section: `_part/${section.id}/${doc.id}/${part
                  .replace(/[^\w]+/gi, "-")
                  .replace(/^-+|-+$/g, "")
                  .toLowerCase()}`,
                label: part,
                predicate: () => this.state.section === tab.section,
              })),
            ];
          })
          .flat()
      );
    });
    sectionsCache.shift();
    this.setState({
      sections: sectionsCache,
      section: sectionsCache[1].section,
    });
  }

  render() {
    return (
      <SettingsView
        sections={this.state.sections}
        section={this.state.section}
        theme={this.props.theme}
        sidebarTheme={this.props.sidebarTheme}
        guestWindow={this.props.guestWindow}
        windowOnTop={this.props.windowOnTop}
        popout={this.props.popout}
        onPopout={() => this.openPopout()}
        onClose={() => getModule(["popLayer"], false).popLayer()}
        onSetSection={(section) => {
          if (section.startsWith("_part/")) {
            this.scrollTo(section.split("/").pop());
          } else if (this.state.section === section) {
            this.scrollTo();
          } else {
            this.setState({ section });
          }
        }}
      />
    );
  }

  scrollTo(part) {
    try {
      const partElement = document.getElementById(part);
      partElement.scrollIntoView();
    } catch {}
  }

  openPopout() {
    getModule(["popLayer"], false).popLayer();
    getModule(["setAlwaysOnTop", "open"], false).open(
      "DISCORD_POWERCORD_DOCUMENTATION",
      (key) => (
        <PopoutWindow windowKey={key}>
          <ConnectedDocsLayer popout={true} />
        </PopoutWindow>
      )
    );
  }
}

const ConnectedDocsLayer = Flux.connectStoresAsync(
  [getModule(["theme"]), getModule(["darkSidebar"]), getModule(["getWindow"])],
  ([themeStore, sidebarStore, windowStore]) => ({
    guestWindow: windowStore.getWindow("DISCORD_POWERCORD_DOCUMENTATION"),
    windowOnTop: windowStore.getIsAlwaysOnTop(
      "DISCORD_POWERCORD_DOCUMENTATION"
    ),
    sidebarTheme: sidebarStore.darkSidebar ? "dark" : void 0,
    theme: themeStore.theme,
  })
)(DocsLayer);

module.exports = ConnectedDocsLayer;
