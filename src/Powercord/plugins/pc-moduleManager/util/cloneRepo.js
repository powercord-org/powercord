const { join } = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

module.exports = async function download(url, powercord, type) {
    const dir = type === "plugin" ? join(__dirname, "..") : join(__dirname, "..", "..", "themes")
    const repoName = url.match(/([\w-]+)\/?$/)[1];
    let status;
    let c;

    try {
        c = spawn("git", ["clone", url], {
            cwd: dir,
            windowsHide: true,
        });
    } catch (err) {
        console.error("Could not install plugin", err);
    }

    c.stdout.on("data", (data) => console.log(data.toString()));
    c.stderr.on("data", (data) => {
        data = data.toString()
        console.error(data);

        if (data.includes("already exists")) {
            powercord.api.notices.sendToast(`PDAlreadyInstalled-${Math.floor(Math.random() * 999)}`, {
                header: "Plugin Already Installed",
                content: `${repoName} is already installed.`,
                type: "info",
                timeout: 10e3,
                buttons: [{
                    text: "Got It",
                    color: "green",
                    size: "medium",
                    look: "outlined"
                }]
            })
        }
    })

    c.on("exit", async (code) => {
        if (code === 0) {
            let files;
            try {
                files = fs.readdirSync(join(dir, repoName));
            } catch (e) {
                console.error(e)
            }

            if (files.includes("powercord_manifest.json") || files.includes("manifest.json")) {
                if (type === "plugin") {
                    await powercord.pluginManager.remount(repoName);
                    if (powercord.pluginManager.plugins.has(repoName)) {
                        powercord.api.notices.sendToast(`PDPluginInstalled-${Math.floor(Math.random() * 999)}`, {
                            header: "Plugin Installed",
                            content: `${repoName} installed`,
                            type: "info",
                            timeout: 10e3,
                            buttons: [{
                                text: "Got It",
                                color: "green",
                                size: "medium",
                                look: "outlined",
                            },],
                        });
                    } else {
                        // handle this error somehow
                    }
                } else if (type === "theme") {
                    await powercord.styleManager.loadThemes()
                    if (powercord.styleManager.themes.has(repoName)) {
                        powercord.api.notices.sendToast(`PDPluginInstalled-${Math.floor(Math.random() * 999)}`, {
                            header: "Theme Installed",
                            content: `${repoName} installed`,
                            type: "info",
                            timeout: 10e3,
                            buttons: [{
                                text: "Got It",
                                color: "green",
                                size: "medium",
                                look: "outlined",
                            },],
                        });
                    } else {
                        // also handle this error
                    }
                }
            } else {
                powercord.api.notices.sendToast('PDNoManifest', {
                    header: `This ${type} has no manifest, it may not be a ${type}`,
                    content: `This ${type} has no manifest, it may not be a ${type}`,
                    type: 'info',
                    timeout: 10e3,
                    buttons: [{
                        text: 'Got It',
                        color: 'green',
                        size: 'medium',
                        look: 'outlined',
                    }],
                });

            }
        }
    })
}