var classNames = require("classnames");
var Link = require("react-router").Link;
var React = require("react/addons");

var AppsStore = require("../stores/AppsStore");
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

    var taskListLink = (
      <Link to="app" params={{appId: encodeURIComponent(this.props.appId)}}>
        Task List
      </Link>
    );

    return (
      <p className="text-center text-danger">
        Error fetching task details.
        Go to {taskListLink} to see the full list.
      </p>
    );
  },

  getTaskEndpoints: function () {
    var props = this.props;
    var task = props.task;
    var app = AppsStore.getCurrentApp(props.appId);

    if ((task.ports == null || task.ports.length === 0) &&
        (task.ipAddresses == null || task.ipAddresses.length === 0)) {
      return (<dd>None</dd>);
    }

    if (app.ipAddress != null &&
        app.ipAddress.discovery != null &&
        app.ipAddress.discovery.ports != null &&
        task.ipAddresses != null &&
        task.ipAddresses.length > 0) {

      let endpoints = task.ipAddresses.reduce((memo, address) => {
        app.ipAddress.discovery.ports.forEach(port => {
          memo.push(`${address.ipAddress}:${port.number}`);
        });
        return memo;
      }, []);

      return endpoints.map(endpoint => (
        <dd key={endpoint} className="overflow-ellipsis">
          <a href={`//${endpoint}`} target="_blank">{endpoint}</a>
        </dd>
      ));
    }

    return task.ports.map((port) => {
      let endpoint = `${task.host}:${port}`;
      return (
        <dd key={endpoint} className="overflow-ellipsis">
          <a href={`//${endpoint}`} target="_blank">{endpoint}</a>
        </dd>
      );
    });
  },

  getIpAddresses: function () {
    var props = this.props;
    var task = props.task;

    var ipAddresses = (task.ipAddresses != null && task.ipAddresses.length > 0)
      ? task.ipAddresses.map(address => address.ipAddress)
      : [task.host];

    return ipAddresses.map(ipAddress => (<dd key={ipAddress}>{ipAddress}</dd>));
  },

  getPorts: function () {
    var task = this.props.task;
    var ports = "[]";

    if (task.ports != null && task.ports.length > 0) {
      ports = `[${task.ports.toString()}]`;
    }

    return (<dd>{ports}</dd>);
  },

  getServiceDiscovery: function () {
    var app = AppsStore.getCurrentApp(this.props.appId);

    if (app == null ||
        app.ipAddress == null ||
        app.ipAddress.discovery == null ||
        app.ipAddress.discovery.ports == null ||
        app.ipAddress.discovery.ports.length === 0) {
      return (<dd>n/a</dd>);
    }

    return app.ipAddress.discovery.ports.map(port => (
      <dd key={port.number}>
        {`${port.name}, ${port.number}, ${port.protocol}`}
      </dd>
    ));
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
        <dl className="dl-horizontal task-details">
          <dt>IP Addresses</dt>
          {this.getIpAddresses()}
          <dt>Ports</dt>
          {this.getPorts()}
          <dt>Endpoints</dt>
          {this.getTaskEndpoints()}
          <dt>Service Discovery</dt>
          {this.getServiceDiscovery()}
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
        {this.getErrorMessage(hasError)}
        {this.getTaskDetails()}
      </div>
    );
  }
});

module.exports = TaskDetailComponent;
