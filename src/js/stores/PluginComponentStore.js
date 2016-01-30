import {EventEmitter} from "events";

import PluginDispatcher from "../plugin/external/PluginDispatcher";
import PluginComponentEvents from "../events/PluginComponentEvents";

import Util from "../helpers/Util";

var components = [];

var PluginComponentStore = Util.extendObject(EventEmitter.prototype, {
  getComponents: function () {
    return components;
  }
});

PluginDispatcher.register(event => {
  if (event.eventType === "INJECT_COMPONENT") {
    let component = {
      placeId: event.placeId,
      component: event.component
    };
    components.push(component);
    PluginComponentStore.emit(PluginComponentEvents.CHANGE, component);
  }
});

export default PluginComponentStore;
