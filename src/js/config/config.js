var config = {
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

module.exports = config;
