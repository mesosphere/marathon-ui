import {EventEmitter} from "events";
import React from "react/addons";
import PluginDispatcher from "../plugin/shared/PluginDispatcher";
import Util from "../helpers/Util";
import NavTabEvents from "../events/NavTabEvents";

import DeploymentsListComponent
  from "../components/DeploymentsListComponent";
import AppsAndGroupsListComponent
  from "../components/AppsAndGroupsListComponent";

var tabs = [
  {
    id: "/apps",
    text: "Applications",
    component: AppsAndGroupsListComponent
  },
  {
    id: "/deployments",
    text: "Deployments",
    component: DeploymentsListComponent
  }
];

function appendTab(tab) {
  tabs.push(tab);
}

var NavTabStore = Util.extendObject(EventEmitter.prototype, {
  getTabs: function () {
    return tabs;
  }
});

PluginDispatcher.register(event => {
  if (event.eventType === NavTabEvents.APPEND_NAVTAB) {
    event.data.map(appendTab);
    NavTabStore.emit(NavTabEvents.CHANGE);
  }
});

export default NavTabStore;
