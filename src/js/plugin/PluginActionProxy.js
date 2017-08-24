import PluginActions from "./shared/PluginActions";
import PluginDispatcher from "./shared/PluginDispatcher";

import DialogActions from "../actions/DialogActions";
import FormActions from "../actions/FormActions";

var proxies = [];

function registerProxy(proxy) {
  proxies.push(proxy);
}

registerProxy({
  pluginActionType: PluginActions.DIALOG_ALERT,
  actionFunction: DialogActions.alert
});

registerProxy({
  pluginActionType: PluginActions.FORM_INSERT,
  actionFunction: FormActions.insert
});

registerProxy({
  pluginActionType: PluginActions.FORM_UPDATE,
  actionFunction: FormActions.update
});

registerProxy({
  pluginActionType: PluginActions.FORM_DELETE,
  actionFunction: FormActions.delete
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

