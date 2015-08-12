var classNames = require("classnames");
var Link = require("react-router").Link;
var React = require("react/addons");

var States = require("../constants/States");
var TimeFieldComponent = require("../components/TimeFieldComponent");
var TaskHealthComponent = require("../components/TaskHealthComponent");
var TaskMesosUrlComponent = require("../components/TaskMesosUrlComponent");
var HealthStatus = require("../constants/HealthStatus");

var TaskDetailComponent = React.createClass({
  displayName: "TaskDetailComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    fetchState: React.PropTypes.number.isRequired,
    hasHealth: React.PropTypes.bool,
    task: React.PropTypes.object,
    taskHealthMessage: React.PropTypes.string
  },

  getErrorMessage: function (hasError) {
    if (!hasError) {
      return null;
    }

    return (
      <p className="text-center text-danger">
        Error fetching task details.
        Go to <Link to="app" params={{appId: encodeURIComponent(this.props.appId)}}>Task List</Link> to see the full list.
      </p>
    );
  },

  getTaskHealthComponent: function () {
    var props = this.props;
    var task = props.task;

    if (task == null || !props.hasHealth) {
      return null;
    }

    return <TaskHealthComponent task={task} />;
  },

  getTaskDetails: function () {
    var props = this.props;
    var task = props.task;

    if (task == null) {
      return null;
    }

    var taskHealth = task.healthStatus;
    var healthClassSet = classNames({
      "text-unhealthy": taskHealth === HealthStatus.UNHEALTHY,
      "text-muted": taskHealth === HealthStatus.UNKNOWN
    });

    var timeNodes = [
      {
        label: "Staged at",
        time: task.stagedAt
      }, {
        label: "Started at",
        time: task.startedAt
      }
    ];

    var timeFields = timeNodes.map(function (timeNode, index) {
      return (
        <TimeFieldComponent
          key={index}
          label={timeNode.label}
          time={timeNode.time} />
      );
    });

    return (
      <div>
        <dl className="dl-horizontal">
          <dt>Host</dt>
          <dd>{task.host}</dd>
          <dt>Ports</dt>
          <dd>[{task.ports.toString()}]</dd>
          <dt>Status</dt>
          <dd>{task.status}</dd>
          {timeFields}
          <dt>Version</dt>
          <dd>
            <time dateTime={task.version}>
              {new Date(task.version).toLocaleString()}
            </time>
          </dd>
          <dt>Health</dt>
          <dd className={healthClassSet}>{props.taskHealthMessage}</dd>
          <dt>Mesos details</dt>
          <dd><TaskMesosUrlComponent task={task}/></dd>
        </dl>
        {this.getTaskHealthComponent()}
      </div>
    );
  },

  render: function () {
    var props = this.props;
    var task = props.task;

    var hasError =
      props.fetchState === States.STATE_ERROR ||
      task == null;

    return (
      <div className="page-body page-body-no-top">
        <h5>Task Details</h5>
        {this.getErrorMessage(hasError)}
        {this.getTaskDetails()}
      </div>
    );
  }
});

module.exports = TaskDetailComponent;
