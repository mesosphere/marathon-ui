import PluginDispatcher from "./PluginDispatcher";

var PluginHelper = {
  injectComponent: function (component, placeId) {
    PluginDispatcher.dispatch({
      eventType: "INJECT_COMPONENT",
      placeId: placeId,
      component: component
    });
  },

  registerMe: function (pluginId) {
    PluginDispatcher.dispatch({
      eventType: "STARTUP_COMPLETE",
      pluginId: pluginId
    });
  }
};

export default PluginHelper;
