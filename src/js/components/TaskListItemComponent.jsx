import classNames from "classnames";
import objectPath from "object-path";
import React from "react/addons";
import Moment from "moment";
import config from "../config/config";


import AppsStore from "../stores/AppsStore";
import HealthStatus from "../constants/HealthStatus";
import TaskStatus from "../constants/TaskStatus";
import TaskFileDownloadComponent from "../components/TaskFileDownloadComponent";

function joinNodes(nodes, separator = ", ") {
  var lastIndex = nodes.length - 1;
  return nodes.map((node, i) => {
    if (lastIndex === i) {
      separator = null;
    }
    return (
      <span className="text-muted" key={i}>
        {node}{separator}
      </span>
    );
  });
}

var TaskListItemComponent = React.createClass({
  displayName: "TaskListItemComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    hasHealth: React.PropTypes.bool,
    isActive: React.PropTypes.bool.isRequired,
    onToggle: React.PropTypes.func.isRequired,
    sortKey: React.PropTypes.string,
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
        <a className="text-muted"
            href={`${config.slavesScheme}://${task.host}:${ports[0]}`}
            target="_blank">
          {`${task.host}:${ports[0]}`}
        </a>
      );
    }

    if (ports != null && ports.length > 1) {
      let portNodes = ports.map(function (port) {
        return (
          <a key={`${task.host}:${port}`}
              className="text-muted"
              href={`${config.slavesScheme}://${task.host}:${port}`}
              target="_blank">
            {port}
          </a>
        );
      });

      return (
        <span className="text-muted">
          {task.host}:[{joinNodes(portNodes)}]
        </span>
      );
    }
  },

  getEndpoints: function () {
    var app = AppsStore.getCurrentApp(this.props.appId);

    if (app.ipAddress == null) {
      return this.getHostAndPorts();
    }

    return this.getServiceDiscoveryEndpoints();
  },

  getServiceDiscoveryEndpoints: function () {
    var props = this.props;
    var task = props.task;
    var app = AppsStore.getCurrentApp(props.appId);

    if (objectPath.get(app, "ipAddress.discovery.ports") != null &&
        task.ipAddresses != null &&
        task.ipAddresses.length > 0) {

      let serviceDiscoveryPorts = app.ipAddress.discovery.ports;

      let endpoints = task.ipAddresses.map((address) => {
        let ipAddress = address.ipAddress;
        if (serviceDiscoveryPorts.length === 1) {
          let port = serviceDiscoveryPorts[0].number;
          return (
            <a key={`${ipAddress}:${port}`}
               className="text-muted"
               href={`${config.slavesScheme}://${ipAddress}:${port}`}>
              {`${ipAddress}:${port}`}
            </a>
          );
        }

        let portNodes = serviceDiscoveryPorts.map((port) => {
          return (
            <a key={`${ipAddress}:${port.number}`}
                className="text-muted"
                href={`${config.slavesScheme}://${ipAddress}:${port.number}`}>
              {port.number}
            </a>
          );
        });

        if (portNodes.length) {
          return (
            <span key={address.ipAddress} className="text-muted">
              {address.ipAddress}:[{joinNodes(portNodes)}]
            </span>
          );
        }

        return (
          <span key={address.ipAddress} className="text-muted">
            {address.ipAddress}
          </span>
        );
      });

      return (
        <span className="text-muted">
          {joinNodes(endpoints)}
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
    var sortKey = this.props.sortKey;
    var hasHealth = !!this.props.hasHealth;
    var version;
    var endpoints;
    var status = "Waiting";

    if (task.status != null) {
      if (task.status !== TaskStatus.SUSPENDED) {
        version = new Date(task.version).toISOString();
        endpoints = this.getEndpoints();
      }
      status = task.status;
    }

    var taskId = task.id;
    var taskURI = "#apps/" +
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
      "unknown": taskHealth === HealthStatus.UNKNOWN,
      "cell-highlighted": sortKey === "healthStatus"
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

    var idClassSet = classNames({
      "cell-highlighted": sortKey === "id"
    });

    var versionClassSet = classNames("text-right", {
      "cell-highlighted": sortKey === "version"
    });

    var updatedAtClassSet = classNames("text-right", {
      "cell-highlighted": sortKey === "updatedAt"
    });

    var statusCellClassSet = classNames("text-center", {
      "cell-highlighted": sortKey === "status"
    });

    return (
      <tr className={listItemClassSet}>
        <td width="1" className="clickable" onClick={this.handleClick}>
          <input type="checkbox"
            checked={this.props.isActive}
            onChange={this.handleCheckboxClick} />
        </td>
        <td className={idClassSet}>
          <a href={taskURI}>{taskId}</a>
          <br />
          {endpoints}
        </td>
        <td className={healthClassSet} title={this.props.taskHealthMessage}>
          {this.props.taskHealthMessage}
        </td>
        <td className={statusCellClassSet}>
          <span className={statusClassSet}>
            {status}
          </span>
        </td>
        <td className="text-center">
          <TaskFileDownloadComponent task={task} fileName="stderr" />
        </td>
        <td className="text-center">
          <TaskFileDownloadComponent task={task} fileName="stdout" />
        </td>
        <td className={versionClassSet}>
          <span title={version}>
            {version && new Moment(version).fromNow() || "---"}
          </span>
        </td>
        <td className={updatedAtClassSet}>
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

export default TaskListItemComponent;
