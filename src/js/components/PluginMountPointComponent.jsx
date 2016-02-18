import React from "react/addons";

import PluginComponentEvents from "../events/PluginComponentEvents";
import PluginComponentStore from "../stores/PluginComponentStore";

var PluginMountPointComponent = React.createClass({

  propTypes: {
    placeId: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      mountPoint: []
    };
  },

  componentWillMount: function () {
    var components = PluginComponentStore.components
      .filter(component => {
        return component.placeId === this.props.placeId;
      });

    if (components.length > 0) {
      this.setState({
        mountPoint: React.addons.update(this.state.mountPoint, {
          $push: components.map(component => component.component)
        })
      });
    }

    PluginComponentStore.on(PluginComponentEvents.CHANGE,
      this.handleComponentStoreChange);
  },

  componentWillUnmount: function () {
    PluginComponentStore.removeListener(PluginComponentEvents.CHANGE,
      this.handleComponentStoreChange);
  },

  handleComponentStoreChange: function (component) {
    if (component.placeId !== this.props.placeId) {
      return;
    }

    this.setState({
      mountPoint: React.addons.update(this.state.mountPoint, {
        $push: [component.component]
      })
    });
  },

  render: function () {
    return <div>{this.state.mountPoint}</div>;
  }
});

export default PluginMountPointComponent;
