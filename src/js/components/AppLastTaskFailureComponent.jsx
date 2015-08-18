var React = require("react/addons");

var AppsStore = require("../stores/AppsStore");
var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var TaskMesosUrlComponent = require("../components/TaskMesosUrlComponent");

var AppLastTaskFailureComponent = React.createClass({
  displayName: "AppLastTaskFailureComponent",

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
        <span className="text-muted">This app does not have failed task</span>
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
      </div>
    );
  }
});

module.exports = AppLastTaskFailureComponent;
