const {Plugin} = require("powercord/entities")
const {getOwnerInstance, waitFor} = require("powercord/util")
const {inject, uninject} = require("powercord/injector")

class ClassList {
	constructor(className) {
		this.tokens = new Set(className.split(" "))
	}

	add(c) {
		this.tokens.add(c)
	}

	remove(c) {
		this.tokens.delete(c)
	}

	conditional(cond, c) {
		if (cond) this.add(c)
		else this.remove(c)
	}

	name() {
		return [...this.tokens.values()].join(" ")
	}
}

module.exports = class GuildClasses extends Plugin {
	constructor() {
		super()
	}

	startPlugin() {
		this._patchGuild()
	}

	pluginWillUnload () {
		uninject("cadence-guild-classes")
	}

	async _patchGuild() {
		const guildInner = await waitFor(".blobContainer-239gwq")
		const guildElement = guildInner.parentElement
		const Guild = getOwnerInstance(guildElement)
		inject("cadence-guild-classes", Guild.constructor.prototype, "render", (_, res) => {
			if (res._owner) {
				let hovered = res._owner.memoizedState.hovered
				let selected = res._owner.pendingProps.selected
				let classList = new ClassList(res.props.className)
				classList.conditional(hovered, "pgc-hovered")
				classList.conditional(selected, "pgc-selected")
				res.props.className = classList.name()
			}
			return res
		})
	}
}
