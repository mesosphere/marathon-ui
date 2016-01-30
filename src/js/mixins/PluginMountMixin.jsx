/* eslint-disable no-unused-vars */
import React from "react/addons";
/* eslint-enable no-unused-vars */
import PluginComponentEvents from "../events/PluginComponentEvents";
import PluginComponentStore from "../stores/PluginComponentStore";

import Util from "../helpers/Util";

var mountComponents = function () {
  if (typeof this.pluginPlaces !== "function") {
    return;
  }

  var places = this.pluginPlaces();

  places.forEach(place => {
    this.pluginPlace[place.key] = [];

    var components = PluginComponentStore.getComponents()
      .filter(component => {
        return component.placeId === place.id;
      });

    components.forEach(component => {
      var Component = component.component;
      var componentKey = `${Component.displayName}-${Util.getUniqueId()}`;
      this.pluginPlace[place.key].push(<Component key={componentKey} />);
    });

    if (components.length !== 0) {
      this.forceUpdate();
    }
  });
};

var PluginMountMixin = {
  componentWillMount: function () {
    this.pluginPlace = {};

    mountComponents.call(this);

    PluginComponentStore.on(PluginComponentEvents.CHANGE, this.addComponent);
  },

  componentWillUnmount: function () {
    PluginComponentStore.removeListener(PluginComponentEvents.CHANGE,
      this.addComponent);
  },

  addComponent: function (component) {
    if (typeof this.pluginPlaces !== "function") {
      return;
    }

    var place =
      this.pluginPlaces().find(place => place.id === component.placeId);

    if (place == null) {
      return;
    }

    let Component = component.component;
    let componentKey = `${Component.displayName}-${Util.getUniqueId()}`;
    this.pluginPlace[place.key].push(<Component key={componentKey} />);
    this.forceUpdate();
  },

  getPluginComponents: function (mountPoint) {
    return this.pluginPlace[mountPoint];
  }
};

export default PluginMountMixin;
