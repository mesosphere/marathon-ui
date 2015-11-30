var classNames = require("classnames");
var React = require("react/addons");
var Moment = require("moment");

var AppsStore = require("../stores/AppsStore");
var HealthStatus = require("../constants/HealthStatus");
var TaskStatus = require("../constants/TaskStatus");

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

  getHostAndPorts: function () {
    var task = this.props.task;
    var ports = task.ports;

    if (ports == null || ports.length === 0 ) {
      return (<span className="text-muted">{task.host}</span>);
    }

    if (ports != null && ports.length === 1) {
      return (
        <a className="text-muted" href={`//${task.host}:${ports[0]}`}>
          {`${task.host}:${ports[0]}`}
        </a>
      );
    }

    if (ports != null && ports.length > 1) {
      let portNodes = ports.map(function (port, index) {
        return (
          <span key={port}>
            <a className="text-muted" href={`//${task.host}:${port}`}>
              {port}
            </a>
            {index < ports.length - 1 ? ", " : ""}
          </span>
        );
      });

      return (
        <span className="text-muted">
          {task.host}:[{portNodes}]
        </span>
      );
    }
  },

  getEndpoints: function () {
    var task = this.props.task;

    if (task.ipAddresses == null) {
      return this.getHostAndPorts();
    }

    return this.getServiceDiscoveryEndpoints();
  },

  getServiceDiscoveryEndpoints: function () {
    var props = this.props;
    var task = props.task;
    var app = AppsStore.getCurrentApp(props.appId);

    if (app.ipAddress != null &&
        app.ipAddress.discovery != null &&
        app.ipAddress.discovery.ports != null &&
        task.ipAddresses != null &&
        task.ipAddresses.length > 0) {

      let serviceDiscoveryPorts = app.ipAddress.discovery.ports;

      let endpoints = task.ipAddresses.map((address, i) => {
        let ipAddress = address.ipAddress;
        let trailingComma = i < task.ipAddresses.length - 1;

        if (serviceDiscoveryPorts.length === 1) {
          let port = serviceDiscoveryPorts[0].number;
          return (
            <span className="text-muted" key={`${ipAddress}:${port}`}>
              <a className="text-muted" href={`//${ipAddress}:${port}`}>
                {`${ipAddress}:${port}`}
              </a>
              {trailingComma ? ", " : ""}
            </span>
          );
        }

        let portNodes = serviceDiscoveryPorts.map((port, j) => {
          return (
            <span key={port.number}>
              <a className="text-muted" href={`//${ipAddress}:${port.number}`}>
                {port.number}
              </a>
              {j < serviceDiscoveryPorts.length - 1 ? ", " : ""}
            </span>
          );
        });

        return (
          <span className="text-muted">
            {address.ipAddress}:[{portNodes}]
            {trailingComma ? ", " : ""}
          </span>
        );
      });

      return (
        <span className="text-muted">
          {endpoints}
        </span>
      );
    }
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
      "unhealthy": taskHealth === HealthStatus.UNHEALTHY,
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
          {this.getEndpoints()}
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
