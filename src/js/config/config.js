var packageJSON = require("../../../package.json");

var config = {
  // @@ENV gets replaced by build system
  environment: "@@ENV",
  // If the UI is served through a proxied URL, this can be set here.
  rootUrl: "",
  // Defines the Marathon API URL,
  // leave empty to use the same as the UI is served.
  apiURL: "../",
  // Intervall of API request in ms
  updateInterval: 5000,
  // Local http server URI while tests run
  localTestserverURI: {
    address: "localhost",
    port: 8181
  },
  version: ("@@TEAMCITY_UI_VERSION".indexOf("@@TEAMCITY") === -1) ?
    "@@TEAMCITY_UI_VERSION" :
    `${packageJSON.version}-SNAPSHOT`
};

if (process.env.GULP_ENV === "development") {
  try {
    var configDev = require("./config.dev");
    config = Object.assign(config, configDev);
  } catch (e) {
    console.info("You could copy config.template.js to config.dev.js " +
      "to enable a development configuration.");
  }
}
module.exports = config;
