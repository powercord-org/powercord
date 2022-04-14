const AnsiEscapes = Object.freeze({
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m'
});

const BasicMessages = Object.freeze({
  PLUG_FAILED: `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to plug Powercord :(${AnsiEscapes.RESET}`,
  PLUG_SUCCESS: `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}Powercord has been successfully plugged :D${AnsiEscapes.RESET}`,
  UNPLUG_FAILED: `${AnsiEscapes.BOLD}${AnsiEscapes.RED}Failed to unplug Powercord :(${AnsiEscapes.RESET}`,
  UNPLUG_SUCCESS: `${AnsiEscapes.BOLD}${AnsiEscapes.GREEN}Powercord has been successfully unplugged${AnsiEscapes.RESET}`
});

module.exports = {
  AnsiEscapes,
  BasicMessages
};
