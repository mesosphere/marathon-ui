var configDev = {
  // Defines the Marathon API URL,
  // leave empty to use the same as the UI is served.
  apiURL: process.env.MARATHON_API_URL,
  // If the UI is served through a proxied URL, this can be set here.
  rootUrl: ""
};
module.exports = configDev;
