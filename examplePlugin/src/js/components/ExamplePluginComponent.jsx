import React from "react/addons";

import ExamplePluginStore from "../stores/ExamplePluginStore";
import ExamplePluginEvents from "../events/ExamplePluginEvents";

var MarathonUIPluginAPI = global.MarathonUIPluginAPI;
var PluginActions = MarathonUIPluginAPI.PluginActions;
var PluginDispatcher = MarathonUIPluginAPI.PluginDispatcher;


var ExamplePluginComponent = React.createClass({

  getInitialState: function () {
    return {
      appsCount: 0
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

    PluginDispatcher.dispatch({
      actionType: PluginActions.DIALOG_ALERT,
      data: {
        title: "Hello world",
        message: "Hi, Plugin speaking here."
      }
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
