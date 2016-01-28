import AppDispatcher from "../AppDispatcher";
import PluginActions from "./PluginActions";
import PluginEvents from "../events/PluginEvents";

import Util from "../helpers/Util";

var pluginsMetaData = [];
var pluginsToLoad = [];
var pluginsLoaded = [];
var pluginsErrored = [];

function loadPlugin(pluginInfo) {
  PluginActions.startPlugin(pluginInfo);
}

function loadNextPlugin() {
  if (pluginsToLoad.length === 0) {
    return;
  }
  loadPlugin(pluginsToLoad.shift());
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
      loadNextPlugin();
      break;
  }
});

export default PluginStore;
