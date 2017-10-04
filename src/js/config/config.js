/* global runtimeConfig:true */

import packageJSON from "../../../package.json";

var config = Object.assign({
  // @@ENV gets replaced by build system
  environment: "@@ENV",
  // If the UI is served through a proxied URL, this can be set here.
  rootUrl: "",
  // Defines the Marathon API URL,
  // leave empty to use the same as the UI is served.
  apiURL: "../",
  // Intervall of API request in ms
  updateInterval: 5000,
  // Slaves Scheme
  slavesScheme: "http",
  // Applications reverse-proxy uri
  appReverseProxy: "",
  // Local http server URI while tests run
  localTestserverURI: {
    address: "localhost",
    port: 8181
  },
  version: ("@@TEAMCITY_UI_VERSION".indexOf("@@TEAMCITY") === -1) ?
    "@@TEAMCITY_UI_VERSION" :
    `${packageJSON.version}-SNAPSHOT`
}, runtimeConfig);

export default config;
