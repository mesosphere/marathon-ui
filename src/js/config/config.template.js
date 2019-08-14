import config from "./config";

var configDev = Object.assign(config, {
  // Defines the Marathon API URL, ending in a '/', for example
  // For example: http://localhost:1337/localhost:8080/
  // leave empty to use the same as the UI is served.
  apiURL: "",
  // If the UI is served through a proxied URL, this can be set here.
  // For example: http://localhost:1337/localhost:4200/
  rootUrl: ""
});
export default configDev;
