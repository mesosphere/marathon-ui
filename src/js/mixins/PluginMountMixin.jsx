/* eslint-disable no-unused-vars */
import React from "react/addons";
/* eslint-enable no-unused-vars */
import PluginComponentEvents from "../events/PluginComponentEvents";
import PluginComponentStore from "../stores/PluginComponentStore";

import Util from "../helpers/Util";

function mountComponent(component, place) {
  var Component = component.component;
  var componentKey = `${Component.displayName}-${Util.getUniqueId()}`;
  place.push(<Component key={componentKey} />);
}

function mountComponents() {
  this.pluginPlaces().forEach(place => {
    this.pluginPlace[place.key] = [];

    var components = PluginComponentStore.getComponents()
      .filter(component => {
        return component.placeId === place.id;
      });

    components.forEach(component => {
      mountComponent(component, this.pluginPlace[place.key]);
    });

    if (components.length !== 0) {
      this.forceUpdate();
    }
  });
}

var PluginMountMixin = {
  componentWillMount: function () {
    this.pluginPlace = {};

    if (typeof this.pluginPlaces !== "function") {
      return;
    }

    mountComponents.call(this);

    PluginComponentStore.on(PluginComponentEvents.CHANGE,
      this.handleComponentChange);
  },

  componentWillUnmount: function () {
    if (typeof this.pluginPlaces !== "function") {
      return;
    }

    PluginComponentStore.removeListener(PluginComponentEvents.CHANGE,
      this.handleComponentChange);
  },

  handleComponentChange: function (component) {
    var place =
      this.pluginPlaces().find(place => place.id === component.placeId);

    if (place == null) {
      return;
    }

    mountComponent(component, this.pluginPlace[place.key]);

    this.forceUpdate();
  },

  getPluginComponents: function (mountPoint) {
    return this.pluginPlace[mountPoint];
  }
};

export default PluginMountMixin;
