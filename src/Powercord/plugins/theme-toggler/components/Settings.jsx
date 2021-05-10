const { React, contextMenu, i18n: { Messages } } = require('powercord/webpack');
const { Divider, Button, ContextMenu, Icons: { Overflow } } = require('powercord/components');

const { join } = require('path');
const { shell } = require('electron');

const InstalledProduct = require('../../pc-moduleManager/components/parts/InstalledProduct');

module.exports = class ThemeTogglerSettings extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className='powercord-entities-manage powercord-text'>
                <div className='powercord-entities-manage-header'>
                    <span>{Messages[`POWERCORD_THEMES_INSTALLED`]}</span>
                    <div className='buttons theme-toggler-buttons'>
                        <Button onClick={() => this.enableAll()} color={Button.Colors.GREEN} look={Button.Looks.FILLED} size={Button.Sizes.SMALL}>
                            {Messages.THEME_TOGGLER_ENABLE_ALL}
                        </Button>
                        <Button onClick={() => this.disableAll()} color={Button.Colors.RED} look={Button.Looks.FILLED} size={Button.Sizes.SMALL}>
                            {Messages.THEME_TOGGLER_DISABLE_ALL}
                        </Button>
                        <Overflow onClick={e => this.openContextMenu(e)} onContextMenu={e => this.openContextMenu(e)} />
                    </div>
                </div>
                <Divider/>
                {this.renderBody()}
            </div>
        );
    }

    renderBody () {
        const items = [];
        powercord.styleManager.themes.forEach(theme => items.push(this.renderItem(theme)));

        return(
            <div className='powercord-entities-manage-items'>
                {items}
            </div>
        );
    }

    renderItem(item) {
        return(
            <InstalledProduct
                product={item.manifest}
                isEnabled={item.applied}
                onToggle={v => {
                    if(v) powercord.styleManager.enable(item.entityID);
                    else powercord.styleManager.disable(item.entityID);
                }}
            />
        );
    }

    enableAll() {
        powercord.styleManager.themes.forEach(theme =>
            powercord.styleManager.enable(theme.entityID));
    }

    disableAll() {
        powercord.styleManager.themes.forEach(theme =>
            powercord.styleManager.disable(theme.entityID));
    }

    openContextMenu(e) {
        contextMenu.openContextMenu(e, () => 
            React.createElement(ContextMenu, {
                width: '50px',
                itemGroups: [
                    [
                        {
                            type: 'button',
                            name: Messages['POWERCORD_THEMES_OPEN_FOLDER'],
                            onClick: () => shell.openPath(join(__dirname, '..', '..', '..', 'themes'))
                        },
                        {
                            type: 'button',
                            name: Messages['POWERCORD_THEMES_LOAD_MISSING'],
                            onClick: () => this.loadMissing()
                        }
                    ]
                ]
            })
        )
    }

    loadMissing() {
        powercord.pluginManager.get('pc-moduleManager')._fetchEntities('themes');
    }
}