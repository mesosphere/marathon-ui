var classNames = require("classnames");
var React = require("react/addons");

var States = require("../constants/States");
var TimeFieldComponent = require("../components/TimeFieldComponent");
var TaskHealthComponent = require("../components/TaskHealthComponent");
var HealthStatus = require("../constants/HealthStatus");

var TaskDetailComponent = React.createClass({
  displayName: "TaskDetailComponent",

  propTypes: {
    fetchState: React.PropTypes.number.isRequired,
    hasHealth: React.PropTypes.bool,
    task: React.PropTypes.object.isRequired,
    taskHealthMessage: React.PropTypes.string
  },

  render: function () {
    var task = this.props.task;
    var hasHealth = !!this.props.hasHealth;
    var hasError =
      this.props.fetchState === States.STATE_ERROR ||
      task == null;
    var taskHealth = task.healthStatus;
    var healthClassSet;
    var timeNodes;
    var timeFields;
    var appUri = "#apps/" + encodeURIComponent(this.props.task.appId);

    if (!hasError) {
      healthClassSet = classNames({
        "text-unhealthy": taskHealth === HealthStatus.UNHEALTHY,
        "text-muted": taskHealth === HealthStatus.UNKNOWN
      });

      timeNodes = [
        {
          label: "Staged at",
          time: task.stagedAt
        }, {
          label: "Started at",
          time: task.startedAt
        }
      ];
      timeFields = timeNodes.map(function (timeNode, index) {
        return (
          <TimeFieldComponent
            key={index}
            label={timeNode.label}
            time={timeNode.time} />
        );
      });
    }

    return (
      <div className="page-body page-body-no-top">
        <h5>Task Details</h5>
        {hasError ?
          <p className="text-center text-danger">
            Error fetching task details.
            Go to <a href={appUri}>Task List</a> to see the full list.
          </p> :
          null}
        {<div>
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
            <dd className={healthClassSet}>{this.props.taskHealthMessage}</dd>
          </dl>
          {hasHealth ?
            <TaskHealthComponent task={task} /> :
            null}
        </div>}
      </div>
    );
  }
});

module.exports = TaskDetailComponent;
