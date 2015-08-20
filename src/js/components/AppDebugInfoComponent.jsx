var React = require("react/addons");
var Moment = require("moment");

var AppsStore = require("../stores/AppsStore");
var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var TaskMesosUrlComponent = require("../components/TaskMesosUrlComponent");

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
        <span className="text-muted">This app does not have failed tasks</span>
      );
    }

    const timestamp = lastTaskFailure.timestamp;
    const version = lastTaskFailure.version;

    return (
      <dl className="dl-horizontal">
        <dt>Task id</dt>
        <dd>{lastTaskFailure.taskId}</dd>
        <dt>State</dt>
        <dd>{lastTaskFailure.state}</dd>
        <dt>Message</dt>
        <dd>{lastTaskFailure.message}</dd>
        <dt>Host</dt>
        <dd>{lastTaskFailure.host}</dd>
        <dt>Timestamp</dt>
        <dd>
          <span>{timestamp}</span> ({new Moment(timestamp).fromNow()})
        </dd>
        <dt>Version</dt>
        <dd>
          <span>{version}</span> ({new Moment(version).fromNow()})
        </dd>
        <dt>Mesos Details</dt>
        <dd><TaskMesosUrlComponent task={lastTaskFailure}/></dd>
      </dl>
    );
  },

  getTaskLifetime: function () {
    var app = this.state.app;
    var lifeTime = app.taskStats != null
      ? app.taskStats.lifeTime
      : null;

    if (lifeTime == null) {
      return (
        <span className="text-muted">
          This app does not have task lifetime information
        </span>
      );
    }

    return (
      <dl className="dl-horizontal">
        <dt>Average</dt>
        <dd>{lifeTime.averageSeconds} seconds</dd>
        <dt>Median</dt>
        <dd>{lifeTime.medianSeconds} seconds</dd>
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
      lastScaling = (
        <dd>
          <span>{lastScalingAt}</span> ({new Moment(lastScalingAt).fromNow()})
        </dd>
      );
    }

    return (
      <dl className="dl-horizontal">
        <dt>Scale or Restart</dt>
        {lastScaling}
        <dt>Configuration</dt>
        <dd>
          <span>{lastConfigChangeAt}</span> ({new Moment(lastConfigChangeAt).fromNow()})
        </dd>
      </dl>
    );
  },

  render: function () {
    return (
      <div>
        <h5>
          Last Changes
          <button className="btn btn-sm btn-info pull-right"
            onClick={this.handleRefresh}>
            ↻ Refresh
          </button>
        </h5>
        {this.getLastVersionChange()}
        <h5>
          Last Task Failure
        </h5>
        {this.getLastTaskFailureInfo()}
        <h5>
          Task Lifetime
        </h5>
        {this.getTaskLifetime()}
      </div>
    );
  }
});

module.exports = AppDebugInfoComponent;
