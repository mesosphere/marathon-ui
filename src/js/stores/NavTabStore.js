import {EventEmitter} from "events";
import React from "react/addons";
import Util from "../helpers/Util";

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

var NavTabStore = Util.extendObject(EventEmitter.prototype, {
  getTabs: function () {
    return tabs;
  }
});

export default NavTabStore;
