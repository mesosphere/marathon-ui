import {EventEmitter} from "events";

import ExamplePluginEvents from "../events/ExamplePluginEvents";

var ExamplePluginStore = Object.assign({}, EventEmitter.prototype, {
  apps: []
});

global.PluginDispatcher.register(function (event) {
  switch (event.eventType) {
    case "PLUGIN_APPS_STORE_CHANGE":
      ExamplePluginStore.apps = event.data;
      ExamplePluginStore.emit(ExamplePluginEvents.APPS_CHANGE);
      break;
  }
});

export default ExamplePluginStore;
