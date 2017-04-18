var lazy = require("lazy.js");
var React = require("react");

import EventStore from "../stores/EventStore";
import ServerEvents from "../events/ServerSideEvents";

var EventsListComponent = React.createClass({
  displayName: "EventsListComponent",

  getInitialState: function () {
    return {
      events: EventStore.events
    };
  },

  componentWillMount: function () {
    EventStore.on(ServerEvents.NEW_EVENT, this.onDeploymentsChange);
  },

  componentWillUnmount: function () {
    EventStore.removeListener(ServerEvents.NEW_EVENT,
      this.onDeploymentsChange);
  },

  onDeploymentsChange: function () {
    this.setState({
      events: EventStore.events
    });
  },

  getEventNodes: function () {
    return lazy(this.state.events)
      .map(function (event) {
        return (
          <tr key={event.keyId}>
            <td className="text-center text-muted">{event.timestamp}</td>
            <td className="text-center text-muted">{event.eventType}</td>
            <td className="text-center text-muted">{event.id}</td>
          </tr>
        );
      })
      .value();
  },

  render: function () {
    return (
      <div>
        <table className="table table-fixed">
          <thead>
          <tr>
            <th className="text-center"><span>Timestamp</span></th>
            <th className="text-center"><span>Event Type</span></th>
            <th className="text-center"><span>Id</span></th>
          </tr>
          </thead>
          <tbody>
          {this.getEventNodes()}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = EventsListComponent;
