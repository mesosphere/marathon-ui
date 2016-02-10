import React from "react/addons";
import Moment from "moment";

import AppsStore from "../stores/AppsStore";
import AppsActions from "../actions/AppsActions";
import AppsEvents from "../events/AppsEvents";
import AppTaskStatsListComponent from "../components/AppTaskStatsListComponent";
import TaskMesosUrlComponent from "../components/TaskMesosUrlComponent";
import UnspecifiedNodeComponent from "../components/UnspecifiedNodeComponent";

function invalidateValue(value, suffix) {
  if (value == null || value === "") {
    return (
      <UnspecifiedNodeComponent />
    );
  } else {
    return (
      <dd>{value} {suffix}</dd>
    );
  }
}

var AppDebugInfoComponent = React.createClass({
  displayName: "AppDebugInfoComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      app: AppsStore.getCurrentApp(this.props.appId)
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppsChange);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE, this.onAppsChange);
  },

  handleRefresh: function () {
    AppsActions.requestApp(this.props.appId);
  },

  onAppsChange: function () {
    this.setState({
      app: AppsStore.getCurrentApp(this.props.appId)
    });
  },

  getLastTaskFailureInfo: function () {
    var lastTaskFailure = this.state.app.lastTaskFailure;

    if (lastTaskFailure == null) {
      return (
        <span className="text-muted">
          This app does not have failed tasks
        </span>
      );
    }

    const timestamp = lastTaskFailure.timestamp;
    const timeStampText = new Date(timestamp) > new Date()
      ? "Just now"
      : new Moment(timestamp).fromNow();
    const version = lastTaskFailure.version;

    return (
      <dl className="dl-horizontal flush-bottom">
        <dt>Task id</dt>
        {invalidateValue(lastTaskFailure.taskId)}
        <dt>State</dt>
        {invalidateValue(lastTaskFailure.state)}
        <dt>Message</dt>
        {invalidateValue(lastTaskFailure.message)}
        <dt>Host</dt>
        {invalidateValue(lastTaskFailure.host)}
        <dt>Timestamp</dt>
        <dd>
          <span>{new Date(timestamp).toLocaleString()}</span> ({timeStampText})
        </dd>
        <dt>Version</dt>
        <dd>
          <span>
            {new Date(version).toLocaleString()}
          </span> ({new Moment(version).fromNow()})
        </dd>
        <dt>Mesos Details</dt>
        <dd><TaskMesosUrlComponent task={lastTaskFailure}/></dd>
      </dl>
    );
  },

  getLastVersionChange: function () {
    var versionInfo = this.state.app.versionInfo;

    if (versionInfo == null) {
      return (
        <span className="text-muted">
          This app does not have version change information
        </span>
      );
    }

    const lastScalingAt = versionInfo.lastScalingAt;
    const lastConfigChangeAt = versionInfo.lastConfigChangeAt;

    var lastScaling = (
      <dd>
        <span>No operation since last config change</span>
      </dd>
    );

    if (lastScalingAt !== lastConfigChangeAt) {
      let lastScalingTimestamp = (
        <span>
          {new Date(lastScalingAt).toLocaleString()}
        </span>
      );
      lastScaling = (
        <dd>
          {lastScalingTimestamp} ({new Moment(lastScalingAt).fromNow()})
        </dd>
      );
    }

    var lastConfigTimestamp = (
      <span>
        {new Date(lastConfigChangeAt).toLocaleString()}
      </span>
    );
    var lastConfig = (
      <dd>
        {lastConfigTimestamp} ({new Moment(lastConfigChangeAt).fromNow()})
      </dd>
    );

    return (
      <dl className="dl-horizontal flush-bottom">
        <dt>Scale or Restart</dt>
        {lastScaling}
        <dt>Configuration</dt>
        {lastConfig}
      </dl>
    );
  },

  render: function () {
    return (
      <div>
        <button className="btn btn-sm btn-default pull-right"
          onClick={this.handleRefresh}>
          ↻ Refresh
        </button>
        <div className="panel-group flush-top">
          <div className="panel panel-header panel-inverse">
            <div className="panel-heading">
              Last Changes
            </div>
          </div>
          <div className="panel panel-body panel-inverse">
            {this.getLastVersionChange()}
          </div>
        </div>
        <div className="panel-group flush-top">
          <div className="panel panel-header panel-inverse">
            <div className="panel-heading">
              Last Task Failure
            </div>
          </div>
          <div className="panel panel-body panel-inverse">
            {this.getLastTaskFailureInfo()}
          </div>
        </div>
        <AppTaskStatsListComponent taskStatsList={this.state.app.taskStats} />
      </div>
    );
  }
});

export default AppDebugInfoComponent;
