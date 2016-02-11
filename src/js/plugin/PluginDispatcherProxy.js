import PluginDispatcher from "./shared/PluginDispatcher";
import Util from "../helpers/Util";

export default class PluginDispatcherProxy {

  constructor(pluginId) {
    if (!Util.isString(pluginId) || pluginId === "") {
      throw new TypeError(
        "Plugin id may only be a String with at least one character"
      );
    }

    this.pluginId = pluginId;
    Object.freeze(this);
  }

  static create(pluginId) {
    return new PluginDispatcherProxy(pluginId);
  };

  register(callback) {
    return PluginDispatcher.register(callback);
  };

  unregister(id) {
    PluginDispatcher.unregister(id);
  };

  waitFor(...ids) {
    PluginDispatcher.waitFor(ids);
  };

  dispatch(payload) {
    payload = payload || {};
    payload.pluginId = this.pluginId;
    PluginDispatcher.dispatch(payload);
  };

  isDispatching() {
    return PluginDispatcher.isDispatching();
  };

}
