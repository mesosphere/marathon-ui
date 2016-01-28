import "babel-polyfill";

console.log("Example Plugin Loaded");

global.onmessage = function (e) {
  console.log("PluginDispatcher received",
   e.data.PluginDispatcher);
  global.PluginDispatcher = e.data.PluginDispatcher;
};
