const fkill = require('fkill');

(async () => {
	await fkill("DiscordCanary.exe", {"force": true, "tree": true});
})();
