module.exports = function () {
  console.log('y u enabled me >:(');
  /*
   * Consider moving this to pc-router?
   *
   * Base URL: powercord.dev/l/
   * Opening the link in a web browser should trigger RPC event "DEEPLINK" with the full link to handle
   *
   * - Go to settings:                                settings
   * - Go to settings (specific tab):                 settings/<settings-id>
   * - Go to store:                                   store/<plugin|theme> (default plugin)
   * - Go to store item:                              store/<plugin|theme>/<id>
   * - Go to store form:                              store/form/<form-name>
   * - Go to plugin requests:                         store/requests
   * - Go to plugin requests (specific req):          store/requests/<issue-id>
   * - Go to docs:                                    docs
   * - Go to docs (specific page):                    docs/<category>/<page>
   * - Go to plugins                                  plugins  (shortcut of settings/pc-moduleManager-plugins)
   * - Go to plugins & scroll to a specific one       plugins#<plugin-id>
   * - Go to themes                                   themes  (shortcut of settings/pc-moduleManager-themes)
   * - Go to themes & scroll to a specific one        themes#<theme-id>
   * - Go to Quick CSS                                themes/quick-css
   * - Go to a theme settings                         themes/<theme-id>/settings
   * - Go to a theme css plugins config               themes/<theme-id>/plugins
   * - Go to the updater                              updater  (shortcut of settings/pc-updater)
   * - Open change logs                               change-logs
   */
};
