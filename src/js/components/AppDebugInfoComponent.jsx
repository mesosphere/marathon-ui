var React = require("react/addons");

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
        <dd>{lastTaskFailure.timestamp}</dd>
        <dt>Version</dt>
        <dd>{lastTaskFailure.version}</dd>
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

  render: function () {
    return (
      <div>
        <h5>
          Last Task Failure
          <button className="btn btn-sm btn-info pull-right"
            onClick={this.handleRefresh}>
            ↻ Refresh
          </button>
        </h5>
        <div>
          {this.getLastTaskFailureInfo()}
        </div>
        <h5>
          Task Lifetime
        </h5>
        <div>
          {this.getTaskLifetime()}
        </div>
      </div>
    );
  }
});

module.exports = AppDebugInfoComponent;
