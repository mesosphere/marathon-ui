import {EventEmitter} from "events";
import React from "react/addons";

import PluginDispatcher from "../plugin/external/PluginDispatcher";
import PluginEvents from "../plugin/external/PluginEvents";
import PluginComponentEvents from "../events/PluginComponentEvents";

import Util from "../helpers/Util";

var components = [];

var PluginComponentStore = Util.extendObject(EventEmitter.prototype, {
  get components() {
    return components;
  }
});

PluginDispatcher.register(event => {
  if (event.eventType === PluginEvents.INJECT_COMPONENT) {
    let componentObj = {
      placeId: event.placeId,
      component: event.component
    };
    let Component = componentObj.component;
    let componentKey = `${Component.displayName}-${Util.getUniqueId()}`;
    componentObj.component =
      React.createElement(Component, {key: componentKey});
    components.push(componentObj);
    PluginComponentStore.emit(PluginComponentEvents.CHANGE, componentObj);
  }
});

export default PluginComponentStore;
