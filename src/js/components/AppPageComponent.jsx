import React from "react/addons";
import classNames from "classnames";
import Mousetrap from "mousetrap";

import AppsEvents from "../events/AppsEvents";
import AppsStore from "../stores/AppsStore";
import BreadcrumbComponent from "../components/BreadcrumbComponent";
import AppHealthBarComponent from "./AppHealthBarComponent";
import AppPageControlsComponent from "./AppPageControlsComponent";
import AppStatusComponent from "../components/AppStatusComponent";
import AppVersionsActions from "../actions/AppVersionsActions";
import AppDebugInfoComponent from "../components/AppDebugInfoComponent";
import AppVersionListComponent from "../components/AppVersionListComponent";
import AppVolumesListComponent from "../components/AppVolumesListComponent";
import VolumeDetailsComponent from "../components/VolumeDetailsComponent";
import DialogActions from "../actions/DialogActions";
import DialogStore from "../stores/DialogStore";
import DialogSeverity from "../constants/DialogSeverity";
import HealthStatus from "../constants/HealthStatus";
import VolumesConstants from "../constants/VolumesConstants";
import Messages from "../constants/Messages";
import States from "../constants/States";
import TabPaneComponent from "../components/TabPaneComponent";
import TaskDetailComponent from "../components/TaskDetailComponent";
import TaskViewComponent from "../components/TaskViewComponent";
import AppHealthDetailComponent from "./AppHealthDetailComponent";
import TogglableTabsComponent from "../components/TogglableTabsComponent";
import Util from "../helpers/Util";
import PathUtil from "../helpers/PathUtil";
import TasksActions from "../actions/TasksActions";
import TasksEvents from "../events/TasksEvents";

var tabsTemplate = [
  {id: "apps/:appId", text: "Instances"},
  {id: "apps/:appId/configuration", text: "Configuration"},
  {id: "apps/:appId/debug", text: "Debug"},
  {id: "apps/:appId/volumes", text: "Volumes"}
];

var AppPageComponent = React.createClass({
  displayName: "AppPageComponent",

  contextTypes: {
    router: React.PropTypes.oneOfType([
      React.PropTypes.func,
      // This is needed for the tests, the context differs there.
      React.PropTypes.object
    ])
  },

  getInitialState: function () {
    var settings = this.getRouteSettings(this.props);
    settings.fetchState = States.STATE_LOADING;
    return settings;
  },

  getRouteSettings: function () {
    var router = this.context.router;
    var params = router.getCurrentParams();

    var appId = decodeURIComponent(params.appId);
    var view = params.view;
    var volumeId;
    if (params.volumeId != null) {
      volumeId = decodeURIComponent(params.volumeId);
    }

    var activeTabId = `apps/${encodeURIComponent(appId)}`;

    var activeViewIndex = 0;
    var activeTaskId = null;

    var app = AppsStore.getCurrentApp(appId);

    var tabs = tabsTemplate.map(function (tab) {
      var id = tab.id.replace(":appId", encodeURIComponent(appId));

      return {
        id: id,
        text: tab.text
      };
    });

    if (view === "configuration") {
      activeTabId += "/configuration";
    } else if (view === "debug") {
      activeTabId += "/debug";
    } else if (view === "volumes") {
      activeTabId += "/volumes";
    } else if (volumeId != null) {
      activeViewIndex = 2;
    } else if (view != null) {
      activeTaskId = view;
      activeViewIndex = 1;
    }

    return {
      activeTabId: activeTabId,
      activeTaskId: activeTaskId,
      activeViewIndex: activeViewIndex,
      app: app,
      volumeId: volumeId,
      appId: appId,
      view: decodeURIComponent(params.view),
      tabs: tabs
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppChange);
    AppsStore.on(AppsEvents.REQUEST_APP_ERROR, this.onAppRequestError);
    AppsStore.on(AppsEvents.DELETE_APP, this.onDeleteAppSuccess);
    AppsStore.on(TasksEvents.DELETE_ERROR, this.onDeleteTaskError);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE,
      this.onAppChange);
    AppsStore.removeListener(AppsEvents.REQUEST_APP_ERROR,
      this.onAppRequestError);
    AppsStore.removeListener(AppsEvents.DELETE_APP,
      this.onDeleteAppSuccess);
    AppsStore.removeListener(TasksEvents.DELETE_ERROR,
      this.onDeleteTaskError);
    Mousetrap.unbind(["g e"]);
  },

  componentDidMount: function () {
    Mousetrap.bind(["g e"], this.openEditModal);
  },

  openEditModal: function () {
    var router = this.context.router;
    var app = AppsStore.getCurrentApp(this.state.appId);
    if (this.state.modal == null) {
      router.transitionTo(router.getCurrentPathname(), {}, {
        modal: `edit-app--${app.id}--${app.version}`
      });
    }
  },

  componentWillReceiveProps: function () {
    var params = this.context.router.getCurrentParams();

    var fetchState = this.state.fetchState;
    if (decodeURIComponent(params.appId) !== this.state.appId) {
      fetchState = States.STATE_LOADING;
    }

    this.setState(Util.extendObject(
      this.state,
      {fetchState: fetchState},
      this.getRouteSettings()
    ));
  },

  onAppChange: function () {
    var state = this.state;
    var app = AppsStore.getCurrentApp(state.appId);

    this.setState({
      app: app,
      fetchState: States.STATE_SUCCESS,
      tabs: state.tabs
    });

    if (state.view === "configuration") {
      AppVersionsActions.requestAppVersions(state.appId);
      AppVersionsActions.requestAppVersion(state.appId, app.version);
    }
  },

  onAppRequestError: function (message, statusCode) {
    var fetchState = States.STATE_ERROR;

    switch (statusCode) {
      case 401:
        fetchState = States.STATE_UNAUTHORIZED;
        break;
      case 403:
        fetchState = States.STATE_FORBIDDEN;
        break;
    }

    this.setState({
      fetchState: fetchState
    });
  },

  onDeleteAppSuccess: function () {
    this.context.router.transitionTo("apps");
  },

  onDeleteTaskError: function (errorMessage, statusCode, taskIds) {
    var appId = this.state.appId;
    if (statusCode === 409) {
      const dialogId = DialogActions.confirm({
        actionButtonLabel: "Stop Current Deployment and Scale",
        message: `In order to the kill the tasks and scale the ${appId} to a new
          number of instances, the current deployment will have to be forcefully
          stopped, and a new one started. Please be cautious, as this could
          result in unwanted states.`,
        severity: DialogSeverity.DANGER,
        title: "Error Killing Task and Scaling Application"
      });

      DialogStore.handleUserResponse(dialogId, function () {
        TasksActions.deleteTasksAndScale(appId, taskIds, true);
      });
    } else if (statusCode === 401) {
      DialogActions.alert({
        message: `Error scaling ${appId}: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title:"Error Killing Task and Scaling Application"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error scaling ${appId}: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title:"Error Killing Task and Scaling Application"
      });
    } else {
      DialogActions.alert({
        message: `Error scaling: ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title:"Error Killing Task and Scaling Application"
      });
    }
  },

  handleTabClick: function (id) {
    this.setState({
      activeTabId: id
    });
  },

  getUnhealthyTaskMessage: function (healthCheckResults = []) {
    return healthCheckResults.map((healthCheck, index) => {
      if (healthCheck && !healthCheck.alive) {
        var failedCheck = this.state.app.healthChecks[index];

        var protocol = failedCheck != null && failedCheck.protocol
          ? `${failedCheck.protocol} `
          : "";
        var host = this.state.app.host || "";
        var path = failedCheck != null && failedCheck.path
          ? failedCheck.path
          : "";
        var lastFailureCause = healthCheck.lastFailureCause
          ? `returned with status: '${healthCheck.lastFailureCause}'`
          : "failed";

        return "Warning: Health check " +
          `'${protocol + host + path}' ${lastFailureCause}.`;
      }
    }).join(" ");
  },

  getTaskHealthMessage: function (taskId, unhealthyDetails = false) {
    var task = AppsStore.getTask(this.state.appId, taskId);

    if (task === undefined) {
      return null;
    }

    switch (task.healthStatus) {
      case HealthStatus.HEALTHY:
        return "Healthy";
      case HealthStatus.UNHEALTHY:
        return unhealthyDetails
          ? this.getUnhealthyTaskMessage(task.healthCheckResults)
          : "Unhealthy";
      default:
        return "Unknown";
    }
  },

  getControls: function () {
    var state = this.state;

    if (state.activeViewIndex !== 0) {
      return null;
    }

    return (<AppPageControlsComponent model={state.app} />);
  },

  getTaskDetailComponent: function () {
    var state = this.state;
    var model = state.app;

    var task = AppsStore.getTask(state.appId, state.activeTaskId);

    return (
      <TaskDetailComponent
        appId={state.appId}
        fetchState={state.fetchState}
        taskHealthMessage={this.getTaskHealthMessage(state.activeTaskId, true)}
        hasHealth={Object.keys(model.healthChecks).length > 0}
        task={task} />
    );
  },

  getVolumeStatus: function () {
    var {appId, volumeId} = this.state;
    var volume = AppsStore.getVolumeById(appId, volumeId);

    if (volume == null || volumeId == null) {
      return null;
    }

    var className = classNames("volume-status", {
      "volume-attached": volume.status === VolumesConstants.STATUS.ATTACHED
    });

    return (
      <h2 className={className}>{volume.status}</h2>
    );
  },

  getVolumeDetails: function () {
    var {appId, volumeId} = this.state;

    var volume = AppsStore.getVolumeById(appId, volumeId);

    if (volume == null) {
      return null;
    }

    return (<VolumeDetailsComponent volume={volume} />);
  },

  getAppDetails: function () {
    var state = this.state;
    var model = state.app;

    var volumes = AppsStore.getVolumes(model.id);

    var tabs = state.tabs.filter(tab =>
      !(tab.text === "Volumes" && volumes.length === 0)
    );

    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={state.activeTabId}
          onTabClick={this.handleTabClick}
          tabs={tabs} >
        <TabPaneComponent
            id={"apps/" + encodeURIComponent(state.appId)}>
          <TaskViewComponent
            appId={state.appId}
            fetchState={state.fetchState}
            getTaskHealthMessage={this.getTaskHealthMessage}
            hasHealth={Object.keys(model.healthChecks).length > 0}
            tasks={model.tasks} />
        </TabPaneComponent>
        <TabPaneComponent
            id={"apps/" + encodeURIComponent(state.appId) + "/configuration"}>
          <AppVersionListComponent appId={state.appId} />
        </TabPaneComponent>
        <TabPaneComponent
            id={"apps/" + encodeURIComponent(state.appId) + "/debug"}>
          <AppDebugInfoComponent appId={state.appId} />
        </TabPaneComponent>
        <TabPaneComponent
            id={"apps/" + encodeURIComponent(state.appId) + "/volumes"}>
          <AppVolumesListComponent volumes={volumes} />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

  render: function () {
    var content;
    var state = this.state;
    var model = state.app;
    var volumeId = this.getRouteSettings().volumeId;

    if (this.state.activeViewIndex === 0) {
      content = this.getAppDetails();
    } else if (this.state.activeViewIndex === 1) {
      content = this.getTaskDetailComponent();
    } else if (this.state.activeViewIndex === 2) {
      content = this.getVolumeDetails();
    }

    var groupId = PathUtil.getGroupFromAppId(state.appId);
    var name = volumeId;
    if (volumeId == null) {
      name = PathUtil.getAppName(state.appId);
      var appHealthStatus =
        <AppStatusComponent model={model} showSummary={true} />;

      var appHealthBar = (
        <div className="app-health-detail">
          <AppHealthBarComponent model={model} />
          <AppHealthDetailComponent
            className="list-inline"
            fields={[
              HealthStatus.HEALTHY,
              HealthStatus.UNHEALTHY,
              HealthStatus.UNKNOWN,
              HealthStatus.STAGED,
              HealthStatus.OVERCAPACITY,
              HealthStatus.UNSCHEDULED
            ]}
            model={model} />
          </div>
      );
    }

    return (
      <div>
        <BreadcrumbComponent groupId={groupId}
          appId={state.appId}
          taskId={state.activeTaskId}
          volumeId={state.volumeId} />
        <div className="container-fluid">
          <div className="page-header">
            <h1>{name}</h1>
            {this.getVolumeStatus()}
            {appHealthStatus}
            {appHealthBar}
            {this.getControls()}
          </div>
          {content}
        </div>
      </div>
    );
  }
});

export default AppPageComponent;
