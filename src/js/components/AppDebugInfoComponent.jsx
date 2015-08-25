var React = require("react/addons");
var Moment = require("moment");

var AppsStore = require("../stores/AppsStore");
var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var AppTaskStatsListComponent =
  require("../components/AppTaskStatsListComponent");
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
        <span className="text-muted">
          This app does not have failed tasks
        </span>
      );
    }

    const timestamp = lastTaskFailure.timestamp;
    const version = lastTaskFailure.version;

    return (
      <dl className="dl-horizontal flush-bottom">
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
      <dl className="dl-horizontal flush-bottom">
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

module.exports = AppDebugInfoComponent;
