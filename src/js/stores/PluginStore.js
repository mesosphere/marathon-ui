import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import PluginDispatcher from "../plugin/PluginDispatcher";
import DialogActions from "../actions/DialogActions";
import DialogSeverity from "../constants/DialogSeverity";
import PluginActions from "../actions/PluginActions";
import PluginEvents from "../events/PluginEvents";

import Util from "../helpers/Util";

var pluginsMetaData = [];
var pluginsToLoad = [];
var pluginsStarted = [];
var pluginsErrored = [];

var bootstrapComplete = false;

function loadNextPlugin() {
  if (pluginsToLoad.length === 0) {
    return;
  }
  PluginActions.requestPlugin(pluginsToLoad.shift());
}

function checkForStartupCompleteAndEmit() {
  let allStarted = pluginsMetaData.every(plugin => {
    return pluginsStarted.includes(plugin.id) ||
      pluginsErrored.some(errored => errored.id === plugin.id);
  });

  if (allStarted) {
    bootstrapComplete = true;
    PluginStore.emit(PluginEvents.BOOTSTRAP_COMPLETE);
  }
}

var PluginStore = Util.extendObject(EventEmitter.prototype, {
  bootstrap: function () {
    PluginActions.requestMetaInfo();
  },
  isBootstrapComplete: function () {
    return bootstrapComplete;
  }
});

PluginDispatcher.register(function (event) {
  switch (event.eventType) {
    case "STARTUP_COMPLETE":
      pluginsStarted.push(event.pluginId);
      checkForStartupCompleteAndEmit();
      break;
  }
});

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
      checkForStartupCompleteAndEmit();
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
