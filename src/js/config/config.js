var config = {
  // @@ENV gets replaced by build system
  environment: "@@ENV",
  rootUrl: "ui/",
  // Defines the Marathon API URL,
  // leave empty to use the same as the UI is served.
  apiURL: "",
  // Intervall of API request in ms
  updateInterval: 5000,
  // Local http server URI while tests run
  localTestserverURI: {
    address: "localhost",
    port: 8181
  }
};
if (config.environment === "production") {
  config.rootUrl = "ui/";
}
if (process.env.GULP_ENV === "development") {
  try {
    var configDev = require("./config.dev");
    config = Object.assign(config, configDev);
  } catch (e) {
    // Do nothing
  }
}
module.exports = config;
