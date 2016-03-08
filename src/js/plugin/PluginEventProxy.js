import PluginDispatcher from "./shared/PluginDispatcher";
import PluginEvents from "./shared/PluginEvents";

import AppsEvents from "../events/AppsEvents";
import AppsStore from "../stores/AppsStore";
import AppFormStore from "../stores/AppFormStore";
import FormEvents from "../events/FormEvents";

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
  pluginEvent: PluginEvents.APPS_STORE_CHANGE,
  store: AppsStore,
  storeEvent: AppsEvents.CHANGE,
  storeGetter: "apps"
});

registerProxy({
  pluginEvent: PluginEvents.APP_FORM_STORE_INSERT,
  store: AppFormStore,
  storeEvent: FormEvents.INSERT,
  storeGetter: "fields"
});

registerProxy({
  pluginEvent: PluginEvents.APP_FORM_STORE_UPDATE,
  store: AppFormStore,
  storeEvent: FormEvents.UPDATE,
  storeGetter: "fields"
});

registerProxy({
  pluginEvent: PluginEvents.APP_FORM_STORE_DELETE,
  store: AppFormStore,
  storeEvent: FormEvents.DELETE,
  storeGetter: "fields"
});

var PluginEventProxy = {
  init: function () {
    proxies.forEach(proxy => proxy());
  }
};

export default PluginEventProxy;

