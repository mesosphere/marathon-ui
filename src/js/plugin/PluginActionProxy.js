import PluginActions from "./external/PluginActions";
import PluginDispatcher from "./external/PluginDispatcher";

import DialogActions from "../actions/DialogActions";

var proxies = [];

function registerProxy(proxy) {
  proxies.push(proxy);
}

registerProxy({
  pluginActionType: PluginActions.DIALOG_ALERT,
  actionFunction: DialogActions.alert
});

var PluginActionProxy = {
  init: function () {
    PluginDispatcher.register(function (action) {
      proxies.forEach(proxy => {
        if (proxy.pluginActionType === action.actionType) {
          proxy.actionFunction(action.data);
        }
      });
    });
  }
};

export default PluginActionProxy;

