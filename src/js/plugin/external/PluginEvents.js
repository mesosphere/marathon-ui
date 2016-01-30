const PluginEvents = {};

// Make the properties of the object read-only, but the object extensible.
Object.defineProperty(PluginEvents, "add", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function (key) {
    Object.defineProperty(PluginEvents, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: "PLUGIN_EVENT_" + key
    });
  }
});

var add = PluginEvents.add;

add("APPS_STORE_CHANGE");

export default PluginEvents;
