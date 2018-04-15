module.exports = class Settings extends Aethcord.React.Component {
  toggle (path) {
    return () => {
      Aethcord.PluginStore.store.get(path).toggle();
      this.forceUpdate();
    };
  }

  render () {
    return (
      <div>
        {Array.from(Aethcord.PluginStore.store).map(([ path, plugin ]) => (
          <div>
            Name: {plugin.name} | Enabled: {plugin.enabled.toString()} <button onClick={this.toggle(path)} >Toggle</button>
          </div>
        ))}
        <br />

        <button onClick={() => document.querySelector('#aethcord-settings-container').classList.remove('active')}>Exit</button>
      </div>
    );
  }
};
