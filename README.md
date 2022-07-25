# Replugged
Maintained fork of [powercord](https://github.com/powercord-org/powercord) - a lightweight @discord client mod focused on simplicity and performance.

# Installation
See the [installation page of the Replugged Wiki](https://github.com/replugged-org/replugged/wiki/Installation).

# How can I install Replugged on Stable or PTB?
Injecting to Stable or PTB is unsupported. These versions may not work properly and support will not be given. However, if you wish to use these versions, you can use `npm run plug stable` or `npm run plug ptb` respectively. The `unplug` command works the same way.

# Is this against the ToS?
Long story short... __yes__. Replugged is against the Discord Terms of Service — but, you should keep reading:  

As of right now, __Discord is not going out of their way to detect client mods or ban client mod users__. On top of that, Replugged does not make any manual HTTP requests unlike certain client mods / plugins, so your client's user agent is the same as a legitimate client. Meaning, Discord doesn't detect a client mod like Replugged. They can go out of their way to start detecting it, but they don't.  

Hypothetically speaking - even if they somehow did detect Replugged, users are very unlikely to be banned on sight. It doesn't make sense for Discord to start banning a substantial part of it's userbase (client mod users) without any kind of warning. Not to mention it is mandatory for Replugged plugins to be fully API-compliant and ethical, implying Replugged users can't be banned for indirect ToS violations (e.g. selfbotting).
