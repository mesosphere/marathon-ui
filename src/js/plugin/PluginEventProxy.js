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
  pluginEvent: PluginEvents.APP_FORM_STORE_CHANGE,
  store: AppFormStore,
  storeEvent: FormEvents.CHANGE,
  storeGetter: "fields"
});

registerProxy({
  pluginEvent: PluginEvents.APP_FORM_STORE_VALIDATION_ERROR,
  store: AppFormStore,
  storeEvent: FormEvents.FIELD_VALIDATION_ERROR,
  storeGetter: "validationErrorIndices"
});

var PluginEventProxy = {
  init: function () {
    proxies.forEach(proxy => proxy());
  }
};

export default PluginEventProxy;

