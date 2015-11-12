var classNames = require("classnames");
var React = require("react/addons");
var Moment = require("moment");

var HealthStatus = require("../constants/HealthStatus");
var TaskStatus = require("../constants/TaskStatus");

function buildHref(host, port) {
  return "http://" + host + ":" + port;
}

function buildTaskAnchors(task) {
  var taskAnchors;
  var ports = task.ports;
  var portsLength = ports.length;

  if (portsLength > 1) {
    // Linkify each port with the hostname. The port is the text of the
    // anchor, but the href contains the hostname and port, a full link.
    taskAnchors = (
      <span className="text-muted">
        {task.host}:[{ports.map(function (p, index) {
          return (
            <span key={p}>
              <a className="text-muted" href={buildHref(task.host, p)}>
                {p}
              </a>
              {index < portsLength - 1 ? ", " : ""}
            </span>
          );
        })}]
      </span>
    );
  } else if (portsLength === 1) {
    // Linkify the hostname + port since there is only one port.
    taskAnchors = (
      <a className="text-muted" href={buildHref(task.host, ports[0])}>
        {task.host}:{ports[0]}
      </a>
    );
  } else {
    // Ain't no ports; don't linkify.
    taskAnchors = (
      <span className="text-muted">{task.host}</span>
    );
  }

  return taskAnchors;
}

var TaskListItemComponent = React.createClass({
  displayName: "TaskListItemComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    hasHealth: React.PropTypes.bool,
    isActive: React.PropTypes.bool.isRequired,
    onToggle: React.PropTypes.func.isRequired,
    task: React.PropTypes.object.isRequired,
    taskHealthMessage: React.PropTypes.string
  },

  handleClick: function (event) {
    // If the click happens on the checkbox, let the checkbox's onchange event
    // handler handle it and skip handling the event here.
    if (event.target.nodeName !== "INPUT") {
      this.props.onToggle(this.props.task);
    }
  },

  handleCheckboxClick: function (event) {
    this.props.onToggle(this.props.task, event.target.checked);
  },

  render: function () {
    var task = this.props.task;
    var hasHealth = !!this.props.hasHealth;
    var version = new Date(task.version).toISOString();
    var taskId = task.id;
    var taskUri = "#apps/" +
      encodeURIComponent(this.props.appId) +
      "/" + encodeURIComponent(taskId);

    var taskHealth = task.healthStatus;

    var listItemClassSet = classNames({
      "active": this.props.isActive
    });

    var healthClassSet = classNames({
      "hidden": !hasHealth,
      "sick": taskHealth === HealthStatus.UNHEALTHY,
      "healthy": taskHealth === HealthStatus.HEALTHY,
      "unknown": taskHealth === HealthStatus.UNKNOWN
    });

    var statusClassSet = classNames({
      "text-warning": task.status === TaskStatus.STAGED
    });

    var updatedAtNodeClassSet = classNames({
      "hidden": task.updatedAt == null
    });

    var updatedAtISO;
    var updatedAtLocal;
    if (task.updatedAt != null) {
      updatedAtISO = new Date(task.updatedAt).toISOString();
      updatedAtLocal = new Date(task.updatedAt).toLocaleString();
    }

    return (
      <tr className={listItemClassSet}>
        <td width="1" className="clickable" onClick={this.handleClick}>
          <input type="checkbox"
            checked={this.props.isActive}
            onChange={this.handleCheckboxClick} />
        </td>
        <td>
            <a href={taskUri}>{taskId}</a>
          <br />
          {buildTaskAnchors(task)}
        </td>
        <td className={healthClassSet} title={this.props.taskHealthMessage}>
          {this.props.taskHealthMessage}
        </td>
        <td className="text-center">
          <span className={statusClassSet}>
            {task.status}
          </span>
        </td>
        <td className="text-right">
          <span
            title={version}>
            {new Moment(version).fromNow()}
          </span>
        </td>
        <td className="text-right">
          <time className={updatedAtNodeClassSet}
              dateTime={updatedAtISO}
              title={updatedAtISO}>
            {updatedAtLocal}
          </time>
        </td>
      </tr>
    );
  }
});

module.exports = TaskListItemComponent;
