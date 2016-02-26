import classNames from "classnames";
import {Link} from "react-router";
import objectPath from "object-path";
import React from "react/addons";

import AppsStore from "../stores/AppsStore";
import AppVolumesListComponent from "../components/AppVolumesListComponent";
import States from "../constants/States";
import TimeFieldComponent from "../components/TimeFieldComponent";
import TogglableTabsComponent from "../components/TogglableTabsComponent";
import TabPaneComponent from "../components/TabPaneComponent";
import TaskHealthComponent from "../components/TaskHealthComponent";
import TaskMesosUrlComponent from "../components/TaskMesosUrlComponent";
import TaskFileListComponent from "../components/TaskFileListComponent";
import HealthStatus from "../constants/HealthStatus";

var tabsTemplate = [
  {id: "apps/:appId/:taskId", text: "Working Directory"},
  {id: "apps/:appId/:taskId/volumes", text: "Volumes"}
];

var TaskDetailComponent = React.createClass({
  displayName: "TaskDetailComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    fetchState: React.PropTypes.number.isRequired,
    hasHealth: React.PropTypes.bool,
    task: React.PropTypes.object,
    taskHealthMessage: React.PropTypes.string
  },

  contextTypes: {
    router: React.PropTypes.oneOfType([
      React.PropTypes.func,
      // This is needed for the tests, the context differs there.
      React.PropTypes.object
    ])
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

    if (objectPath.get(app, "ipAddress.discovery.ports") != null &&
        task.ipAddresses != null &&
        task.ipAddresses.length > 0) {

      let ports = app.ipAddress.discovery.ports;
      let endpoints = task.ipAddresses.reduce((memo, address) => {
        ports.forEach(port => {
          memo.push(`${address.ipAddress}:${port.number}`);
        });
        return memo;
      }, []);

      if (endpoints.length) {
        return endpoints.map(endpoint => (
          <dd key={endpoint} className="overflow-ellipsis">
            <a href={`//${endpoint}`} target="_blank">{endpoint}</a>
          </dd>
        ));
      }

      return (<dd>n/a</dd>);
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
    var ipAddresses = task.ipAddresses;

    if (ipAddresses == null || ipAddresses.length === 0) {
      return null;
    }

    return ipAddresses
      .filter(address => address.ipAddress != null)
      .map(address => (
        <dd key={address.ipAddress}>{address.ipAddress}</dd>
      ));
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

    if (objectPath.get(app, "ipAddress.discovery.ports") == null ||
        app.ipAddress.discovery.ports.length === 0) {
      return (<dd>n/a</dd>);
    }

    return app.ipAddress.discovery.ports.map(port => (
      <dd key={port.number}>
        {`${port.name}, ${port.number}, ${port.protocol}`}
      </dd>
    ));
  },

  getStatus: function () {
    var props = this.props;
    var task = props.task;
    if (task == null || task.status == null) {
      return <dd className="text-muted">Unknown</dd>;
    }
    return <dd>{task.status}</dd>;
  },

  getVersion: function () {
    var props = this.props;
    var task = props.task;
    if (task == null || task.version == null) {
      return <dd className="text-muted">None</dd>;
    }
    return (
      <dd>
        <time dateTime={task.version}>
          {task.version}
        </time>
      </dd>
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

    var ipAddressFields = this.getIpAddresses();
    if (ipAddressFields != null && ipAddressFields.length > 0) {
      ipAddressFields.unshift(<dt key="ip-addresses">IP Addresses</dt>);
    }

    return (
      <div>
        <dl className="dl-horizontal task-details">
          <dt>Host</dt>
          <dd>{task.host}</dd>
          {ipAddressFields}
          <dt>Ports</dt>
          {this.getPorts()}
          <dt>Endpoints</dt>
          {this.getTaskEndpoints()}
          <dt>Service Discovery</dt>
          {this.getServiceDiscovery()}
          <dt>Status</dt>
          {this.getStatus()}
          {timeFields}
          <dt>Version</dt>
          {this.getVersion()}
          <dt>Health</dt>
          <dd className={healthClassSet}>{props.taskHealthMessage}</dd>
          <dt>Mesos details</dt>
          <dd><TaskMesosUrlComponent task={task} /></dd>
        </dl>
        {this.getTaskHealthComponent()}
        <hr />
        {this.getTabs(task)}
      </div>
    );
  },

  getTabs: function (task) {
    var appId = this.props.appId;
    var app = AppsStore.getCurrentApp(appId);

    var activeTabId =
      `apps/${encodeURIComponent(appId)}/${encodeURIComponent(task.id)}`;
    var activeTab = this.context.router.getCurrentParams().tab;

    var tabs = tabsTemplate.map(function (tab) {
      var id = tab.id.replace(":appId", encodeURIComponent(appId))
        .replace(":taskId", encodeURIComponent(task.id));

      if (activeTabId == null || tab === activeTab) {
        activeTabId = id;
      }

      return {
        id: id,
        text: tab.text
      };
    });

    if (activeTab === "volumes") {
      activeTabId += "/volumes";
    } else if (activeTab != null) {
      activeTabId = activeTab;
    }

    var volumes = [];

    if (task.localVolumes != null) {
      volumes = task.localVolumes
        .map(volume => {
          if (app.container == null || app.container.volumes == null) {
            return null;
          }
          app.container.volumes.forEach(function (volumeConfig) {
            if (volumeConfig.containerPath &&
                volumeConfig.containerPath === volume.containerPath) {
              Object.keys(volumeConfig).forEach(key =>
                volume[key] = volumeConfig[key]
              );
              volume.appId = app.id;
              volume.taskId = task.id;
              volume.host = task.host;
              volume.status = task.status == null
                ? "Detached"
                : "Attached";
            }
          });
          return volume;
        });
    }

    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={activeTabId}
          tabs={tabs} >
        <TabPaneComponent
            id={tabs[0].id}>
            <TaskFileListComponent task={task} />
        </TabPaneComponent>
        <TabPaneComponent
            id={tabs[1].id}>
          {this.getVolumes(volumes)}
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

  getVolumes: function (volumes) {
    if (this.props.task == null || volumes == null) {
      return null;
    }

    return (
      <AppVolumesListComponent
        volumes={volumes} />
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

export default TaskDetailComponent;
