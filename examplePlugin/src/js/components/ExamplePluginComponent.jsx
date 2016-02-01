import React from "react/addons";

import ExamplePluginStore from "../stores/ExamplePluginStore";
import ExamplePluginEvents from "../events/ExamplePluginEvents";

var {PluginActions, PluginHelper} =
  global.MarathonUIPluginAPI;

var ExamplePluginComponent = React.createClass({

  getInitialState: function () {
    return {
      appsCount: ExamplePluginStore.apps.length
    };
  },

  componentDidMount: function () {
    ExamplePluginStore.on(ExamplePluginEvents.APPS_CHANGE, this.onAppsChange);
  },

  componentWillUnmount: function () {
    ExamplePluginStore.removeListener(ExamplePluginEvents.APPS_CHANGE,
      this.onAppsChange);
  },

  onAppsChange: function () {
    this.setState({
      appsCount: ExamplePluginStore.apps.length
    });
  },

  handleClick: function (e) {
    e.stopPropagation();

    PluginHelper.callAction(PluginActions.DIALOG_ALERT, {
      title: "Hello world",
      message: "Hi, Plugin speaking here."
    });
  },

  render: function () {
    return (
      <div>
        <div className="flex-row">
          <h3 className="small-caps">Example Plugin</h3>
        </div>
        <ul className="list-group filters">
          <li>{this.state.appsCount} applications in total</li>
          <li><hr /></li>
          <li className="clickable" onClick={this.handleClick}>
            <a>Click me</a>
          </li>
        </ul>
      </div>
    );
  }

});

export default ExamplePluginComponent;
