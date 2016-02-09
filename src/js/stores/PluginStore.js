import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import Util from "../helpers/Util";
import DialogActions from "../actions/DialogActions";
import DialogSeverity from "../constants/DialogSeverity";
import PluginActions from "../actions/PluginActions";
import PluginEvents from "../events/PluginEvents";
import PluginModules from "../constants/PluginModules";
import States from "../constants/States";
import pluginScheme from "../stores/schemes/pluginScheme";

var plugins = [];

function addPlugin(data) {
  if (data.id == null && !Util.isObject(data.info)
    && getPluginById(data.id) != null) {
    return;
  }

  plugins.push(Util.extendObject(pluginScheme, data.info, {id: data.id}));
}

function getPluginById(id) {
  return plugins.find((plugin) => plugin.id === id);
}

function updatePluginState(id, state) {
  var plugin = getPluginById(id);
  if (plugin == null) {
    return;
  }

  plugin.state = state;
}

function loadPlugins() {
  plugins.filter((plugin) => {
    return plugin.modules.indexOf(PluginModules.UI) >= 0
      && plugin.state === States.STATE_INITIAL;
  }).forEach((plugin) => {
    plugin.state = States.STATE_LOADING;
    PluginActions.loadPlugin(plugin.id);
  });
}

var PluginStore = Object.assign({
  getPluginLoadingState: function () {
    if (plugins.length === 0) {
      return States.STATE_INITIAL;
    }

    return plugins.map((plugin) => plugin.state)
      .reduce(Math.min);
  },
  resetStore: function () {
    plugins = [];
  }

}, EventEmitter.prototype);

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case PluginEvents.REQUEST_PLUGINS_SUCCESS:
      action.data.forEach(addPlugin);
      PluginStore.emit(PluginEvents.CHANGE);
      loadPlugins();
      break;
    case PluginEvents.LOAD_PLUGIN_SUCCESS:
      updatePluginState(action.id, States.STATE_SUCCESS);
      PluginStore.emit(PluginEvents.CHANGE);
      break;
    case PluginEvents.LOAD_PLUGIN_ERROR:
      updatePluginState(action.id, States.STATE_ERROR);
      let plugin = getPluginById(action.id);
      let message = "";
      if (plugin != null) {
        message = `${plugin.name || plugin.id}`;
      }
      DialogActions.alert({
        title: "Could not load plugin",
        message: message,
        severity: DialogSeverity.WARNING
      });
      PluginStore.emit(PluginEvents.CHANGE);
      break;
  }
});

export default PluginStore;
