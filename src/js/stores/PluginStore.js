import AppDispatcher from "../AppDispatcher";
import DialogActions from "../actions/DialogActions";
import DialogSeverity from "../constants/DialogSeverity";
import PluginActions from "../actions/PluginActions";
import PluginEvents from "../events/PluginEvents";

import Util from "../helpers/Util";

var pluginsMetaData = [];
var pluginsToLoad = [];
var pluginsLoaded = [];
var pluginsErrored = [];

function loadNextPlugin() {
  if (pluginsToLoad.length === 0) {
    return;
  }
  PluginActions.requestPlugin(pluginsToLoad.shift());
}

var PluginStore = {
  bootstrap: function () {
    PluginActions.requestMetaInfo();
  }
};

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case PluginEvents.META_INFO_SUCCESS:
      pluginsMetaData = action.data;
      pluginsToLoad = Util.deepCopy(pluginsMetaData);
      loadNextPlugin();
      break;
    case PluginEvents.REQUEST_SUCCESS:
      pluginsLoaded.push(action.metaInfo);
      loadNextPlugin();
      break;
    case PluginEvents.REQUEST_ERROR:
      pluginsErrored.push(action.metaInfo);
      DialogActions.alert({
        title: `Could not load plugin`,
        message: `${action.metaInfo.name} (${action.metaInfo.hash})`,
        severity: DialogSeverity.WARNING
      });
      loadNextPlugin();
      break;
  }
});

export default PluginStore;
