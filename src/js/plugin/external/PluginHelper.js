import PluginDispatcher from "./PluginDispatcher";
import PluginEvents from "./PluginEvents";

export default class PluginHelper {

  constructor(pluginId) {
    this.pluginId = pluginId;
    Object.freeze(this);
  }

  static create(pluginId) {
    return new PluginHelper(pluginId);
  };

  callAction(action, data) {
    PluginDispatcher.dispatch({
      actionType: action,
      pluginId: this.pluginId,
      data: data
    });
  }

  injectComponent(component, placeId) {
    PluginDispatcher.dispatch({
      eventType: PluginEvents.INJECT_COMPONENT,
      placeId: placeId,
      pluginId: this.pluginId,
      component: component
    });
  }

  registerMe() {
    PluginDispatcher.dispatch({
      pluginId: this.pluginId,
      eventType: PluginEvents.STARTUP_COMPLETE
    });
  }

}

export default PluginHelper;
