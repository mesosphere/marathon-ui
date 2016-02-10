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
  if (data.id == null && !Util.isObject(data.info) &&
      getPluginById(data.id) != null) {
    return;
  }

  plugins.push(Util.extendObject(pluginScheme, data.info, {id: data.id}));
}

function getPluginById(id) {
  return plugins.find(plugin => plugin.id === id);
}

function updatePluginState(id, state) {
  var plugin = getPluginById(id);
  if (plugin == null) {
    return;
  }

  plugin.state = state;
}

function loadPlugins() {
  plugins.filter(plugin => {
    return plugin.modules.includes(PluginModules.UI) &&
      plugin.state === States.STATE_INITIAL;
  })
  .forEach(plugin => {
    plugin.state = States.STATE_LOADING;
    PluginActions.loadPlugin(plugin.id);
  });
}

var PluginStore = Util.extendObject({
  get pluginsLoadingState() {
    if (plugins.length === 0) {
      return States.STATE_INITIAL;
    }

    return plugins.map((plugin) => plugin.state)
      .reduce((pluginAState, pluginBState) => {
        if (pluginAState === States.STATE_INITIAL ||
            pluginBState === States.STATE_INITIAL) {
          return States.STATE_INITIAL;
        }

        if (pluginAState === States.STATE_LOADING ||
            pluginBState === States.STATE_LOADING) {
          return States.STATE_LOADING;
        }

        if (pluginAState === States.STATE_ERROR ||
            pluginBState === States.STATE_ERROR) {
          return States.STATE_ERROR;
        }

        if (pluginAState === States.STATE_UNAUTHORIZED ||
            pluginBState === States.STATE_UNAUTHORIZED) {
          return States.STATE_UNAUTHORIZED;
        }

        if (pluginAState === States.STATE_FORBIDDEN ||
            pluginBState === States.STATE_FORBIDDEN) {
          return States.STATE_FORBIDDEN;
        }

        if (pluginAState === States.STATE_SUCCESS &&
            pluginBState === States.STATE_SUCCESS) {
          return States.STATE_SUCCESS;
        }

        return States.STATE_INITIAL;

      });
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
