import PluginDispatcher from "./external/PluginDispatcher";

import AppsEvents from "../events/AppsEvents";
import AppsStore from "../stores/AppsStore";

import Util from "../helpers/Util";

var proxies = [];

function registerProxy(proxy) {
  proxies.push(function () {
    proxy.store.on(proxy.storeEvent, () => {
      PluginDispatcher.dispatch({
        eventType: proxy.pluginEvent,
        data: Util.deepCopy(proxy.store[proxy.storeGetter])
      });
    });
  });
}

registerProxy({
  pluginEvent: "PLUGIN_APPS_STORE_CHANGE",
  store: AppsStore,
  storeEvent: AppsEvents.CHANGE,
  storeGetter: "apps"
});

var PluginEventProxy = {
  init: function () {
    proxies.forEach(proxy => proxy());
  }
};

export default PluginEventProxy;

