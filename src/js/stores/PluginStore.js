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

var storeData = {
  plugins: [],
  requestState: States.STATE_INITIAL
};

function addPlugin(data) {
  if (data.id == null && !Util.isObject(data.info) &&
      getPluginById(data.id) != null) {
    return;
  }

  storeData.plugins.push(Util.extendObject(
    pluginScheme,
    data.info,
    {id: data.id}
  ));
}

function getPluginById(id) {
  return storeData.plugins.find(plugin => plugin.id === id);
}

function updatePluginState(id, state) {
  var plugin = getPluginById(id);
  if (plugin == null) {
    return;
  }

  plugin.state = state;
}

function loadPlugins() {
  storeData.plugins
    .filter(plugin => {
      return plugin.modules.includes(PluginModules.UI) &&
        plugin.state === States.STATE_INITIAL;
    })
    .forEach(plugin => {
      plugin.state = States.STATE_LOADING;
      PluginActions.loadPlugin(plugin.id);
    });
}

var PluginStore = Util.extendObject(EventEmitter.prototype, {
  get pluginsLoadingState() {
    var {requestState, plugins} = storeData;

    if (requestState === States.STATE_INITIAL ||
        requestState === States.STATE_ERROR ||
        requestState === States.STATE_SUCCESS &&
        plugins.length === 0) {
      return requestState;
    }

    return plugins
      .map(plugin => plugin.state)
      .reduce((pluginAState, pluginBState) => {
        if (pluginAState === States.STATE_SUCCESS &&
            pluginBState === States.STATE_SUCCESS) {
          return States.STATE_SUCCESS;
        }

        let state = Object.values(States)
          .filter(state => state !== States.STATE_SUCCESS)
          .find(state => state === pluginAState || state === pluginBState);

        if (state != null) {
          return state;
        }

        return States.STATE_INITIAL;
      });
  },

  get isPluginsLoadingFinished() {
    var pluginLoadingState = this.pluginsLoadingState;
    return pluginLoadingState !== States.STATE_INITIAL &&
      pluginLoadingState !== States.STATE_LOADING;
  },

  resetStore: function () {
    storeData = {
      plugins: [],
      requestState: States.STATE_INITIAL
    };
  }

});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case PluginEvents.REQUEST_PLUGINS_SUCCESS:
      storeData.requestState = States.STATE_SUCCESS;
      action.data.forEach(addPlugin);
      PluginStore.emit(PluginEvents.CHANGE);
      loadPlugins();
      break;
    case PluginEvents.REQUEST_PLUGINS_ERROR:
      storeData.requestState = States.STATE_ERROR;
      PluginStore.emit(PluginEvents.CHANGE);
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
