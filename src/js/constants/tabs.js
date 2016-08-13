import React from "react/addons";
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

export default tabs;
