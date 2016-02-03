import {EventEmitter} from "events";

import ExamplePluginEvents from "../events/ExamplePluginEvents";

var {PluginDispatcher, PluginEvents} = global.MarathonUIPluginAPI;

var ExamplePluginStore = Object.assign({}, EventEmitter.prototype, {
  apps: []
});

PluginDispatcher.register(function (event) {
  switch (event.eventType) {
    case PluginEvents.APPS_STORE_CHANGE:
      ExamplePluginStore.apps = event.data;
      ExamplePluginStore.emit(ExamplePluginEvents.APPS_CHANGE);
      break;
  }
});

export default ExamplePluginStore;
