import PluginDispatcher from "./external/PluginDispatcher";

export default class PluginDispatcherProxy {

  constructor(pluginId) {
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
