/* eslint-disable no-unused-vars */
import React from "react/addons";
/* eslint-enable no-unused-vars */
import PluginDispatcher from "../plugin/PluginDispatcher";

var PluginMountMixin = {
  componentWillMount: function () {
    this.pluginPlace = {};

    if (typeof this.pluginPlaces !== "function") {
      return;
    }

    var places = this.pluginPlaces();

    places.forEach(place => {
      this.pluginPlace[place.key] = [];

      PluginDispatcher.register(event => {
        if (event.eventType === "INJECT_COMPONENT") {
          if (event.placeId === place.id) {
            let Component = event.component;
            this.pluginPlace[place.key].push(<Component key="test" />);
            this.forceUpdate();
          }
        }
      });
    });
  },

  getPluginComponents: function (mountPoint) {
    return this.pluginPlace[mountPoint];
  }
};

export default PluginMountMixin;
