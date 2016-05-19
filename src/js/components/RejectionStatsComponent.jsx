import React from "react/addons";

import QueueStore from "../stores/QueueStore";
import QueueActions from "../actions/QueueActions";
import QueueEvents from "../events/QueueEvents";

var lazy = require("lazy.js");

var RejectionStatsComponent = React.createClass({
  displayName: "RejectionStatsComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      stats: QueueStore.currentStats
    };
  },

  componentWillMount: function () {
    QueueStore.on(QueueEvents.OFFER_STATS, this.onAppsChange);
  },

  componentWillUnmount: function () {
    QueueStore.removeListener(QueueEvents.OFFER_STATS, this.onAppsChange);
  },

  handleRefresh: function () {
    QueueActions.getOfferStats(this.props.appId);
  },

  onAppsChange: function () {
    this.setState({
      stats: QueueStore.currentStats
    });
  },

  getCountRejections: function () {
    return this.state.stats.count;
  },

  getRejections: function () {
    var count = this.state.stats.count;
    var details = this.state.stats.details;
    if (details!=null) {
      var keys = Object.keys(details);
      return lazy(keys)
        .map(function (key) {
          return (
            <tr key={key}>
              <td className="text-center text-muted">{key}</td>
              <td className="text-center text-muted">{details[key]}</td>
              <td className="text-center text-muted">
                {(100 - (details[key]*100)/count).toFixed(2)}%</td>
            </tr>
          );
        })
        .value();
    }
  },

  lastRejectionsTable: function () {
    return (
      <div>
        <table className="table table-fixed">
          <thead>
          <tr>
            <th className="text-center"><span>Resources</span></th>
            <th className="text-center"><span>Rejected Count</span></th>
            <th className="text-center"><span>Matches</span></th>
          </tr>
          </thead>
          <tbody>
          {this.getRejections()}
          </tbody>
        </table>
      </div>
    );

  },

  render: function () {
    return (
      <div className="panel-group flush-top">
        <div className="panel panel-header panel-inverse">
          <div className="panel-heading">
            Last {this.getCountRejections()} Rejections
          </div>
        </div>
        {this.lastRejectionsTable()}
      </div>);
  }
});

export default RejectionStatsComponent;
