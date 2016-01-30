const PluginActions = {};

// Make the properties of the object read-only, but the object extensible.
Object.defineProperty(PluginActions, "add", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function (key) {
    Object.defineProperty(PluginActions, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: "PLUGIN_ACTION_" + key
    });
  }
});

var add = PluginActions.add;

add("DIALOG_ALERT");

export default PluginActions;
