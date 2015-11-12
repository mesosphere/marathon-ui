var React = require("react/addons");

var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var AppsStore = require("../stores/AppsStore");
var BreadcrumbComponent = require("../components/BreadcrumbComponent");
var AppHealthComponent = require("./AppHealthComponent");
var AppStatus = require("../constants/AppStatus");
var AppStatusComponent = require("../components/AppStatusComponent");
var AppVersionsActions = require("../actions/AppVersionsActions");
var AppDebugInfoComponent = require("../components/AppDebugInfoComponent");
var AppVersionListComponent = require("../components/AppVersionListComponent");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");
var HealthStatus = require("../constants/HealthStatus");
var Messages = require("../constants/Messages");
var States = require("../constants/States");
var TabPaneComponent = require("../components/TabPaneComponent");
var TaskDetailComponent = require("../components/TaskDetailComponent");
var TaskViewComponent = require("../components/TaskViewComponent");
var TaskHealthBreakdownComponent = require("./AppHealthBreakdownComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");
var Util = require("../helpers/Util");
var PathUtil = require("../helpers/PathUtil");
var QueueActions = require("../actions/QueueActions");
var QueueEvents = require("../events/QueueEvents");
var QueueStore = require("../stores/QueueStore");

var tabsTemplate = [
  {id: "apps/:appId", text: "Tasks"},
  {id: "apps/:appId/configuration", text: "Configuration"},
  {id: "apps/:appId/debug", text: "Debug"}
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

    var activeTabId = `apps/${encodeURIComponent(appId)}`;

    var activeViewIndex = 0;
    var activeTaskId = null;

    var app = AppsStore.getCurrentApp(appId);

    var tabs = tabsTemplate.map(function (tab) {
      var id = tab.id.replace(":appId", encodeURIComponent(appId));
      if (activeTabId == null) {
        activeTabId = id;
      }

      return {
        id: id,
        text: tab.text
      };
    });

    if (view === "configuration") {
      activeTabId += "/configuration";
    } else if (view === "debug") {
      activeTabId += "/debug";
    } else if (view != null) {
      activeTaskId = view;
      activeViewIndex = 1;
    }

    return {
      activeTabId: activeTabId,
      activeTaskId: activeTaskId,
      activeViewIndex: activeViewIndex,
      app: app,
      appId: appId,
      view: decodeURIComponent(params.view),
      tabs: tabs
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppChange);
    AppsStore.on(AppsEvents.REQUEST_APP_ERROR, this.onAppRequestError);
    AppsStore.on(AppsEvents.SCALE_APP_ERROR, this.onScaleAppError);
    AppsStore.on(AppsEvents.RESTART_APP_ERROR, this.onRestartAppError);
    AppsStore.on(AppsEvents.DELETE_APP_ERROR, this.onDeleteAppError);
    AppsStore.on(AppsEvents.DELETE_APP, this.onDeleteAppSuccess);
    QueueStore.on(QueueEvents.RESET_DELAY_ERROR, this.onResetDelayError);
    QueueStore.on(QueueEvents.RESET_DELAY, this.onResetDelaySuccess);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE,
      this.onAppChange);
    AppsStore.removeListener(AppsEvents.REQUEST_APP_ERROR,
      this.onAppRequestError);
    AppsStore.removeListener(AppsEvents.SCALE_APP_ERROR,
      this.onScaleAppError);
    AppsStore.removeListener(AppsEvents.RESTART_APP_ERROR,
      this.onRestartAppError);
    AppsStore.removeListener(AppsEvents.DELETE_APP_ERROR,
      this.onDeleteAppError);
    AppsStore.removeListener(AppsEvents.DELETE_APP,
      this.onDeleteAppSuccess);
    QueueStore.removeListener(QueueEvents.RESET_DELAY_ERROR,
      this.onResetDelayError);
    QueueStore.removeListener(QueueEvents.RESET_DELAY,
      this.onResetDelaySuccess);
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

  onScaleAppError: function (errorMessage, statusCode, instances) {
    if (statusCode === 409) {
      let appId = this.state.appId;
      const dialogId = DialogActions.
        confirm(`Failed to scale ${appId}. If you want to stop any current
          deployment of the app and force a new one to scale it,
          press the OK button.`);
      DialogStore.handleUserResponse(dialogId, function () {
        AppsActions.scaleApp(appId, instances, true);
      });
    } else if (statusCode === 401) {
      DialogActions.alert(`Not scaling: ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Not scaling: ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(`Not scaling:
          ${errorMessage.message || errorMessage}`);
    }
  },

  onRestartAppError: function (errorMessage, statusCode) {
    if (statusCode === 401) {
      DialogActions.alert(`Error restarting app: ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Error restarting app: ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(
        `Error restarting app: ${errorMessage.message || errorMessage}`
      );
    }
  },

  onDeleteAppError: function (errorMessage, statusCode) {
    if (statusCode === 401) {
      DialogActions.alert(`Error destroying app: ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Error destroying app: ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(
        `Error destroying app: ${errorMessage.message || errorMessage}`
      );
    }
  },

  onDeleteAppSuccess: function () {
    this.context.router.transitionTo("apps");
  },

  onResetDelaySuccess: function () {
    DialogActions.alert("Delay reset succesfully");
  },

  onResetDelayError: function (errorMessage, statusCode) {
    if (statusCode === 401) {
      DialogActions.alert(`Error resetting delay on app:
        ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Error resetting delay on app:
        ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(
        `Error resetting delay on app: ${errorMessage.message || errorMessage}`
      );
    }
  },

  handleTabClick: function (id) {
    this.setState({
      activeTabId: id
    });
  },

  handleScaleApp: function () {
    const dialogId =
      DialogActions.prompt("Scale to how many instances?",
        this.state.app.instances.toString()
      );

    DialogStore.handleUserResponse(dialogId, function (instancesString) {
      if (instancesString != null && instancesString !== "") {
        let instances = parseInt(instancesString, 10);

        AppsActions.scaleApp(this.state.appId, instances);
      }
    }.bind(this));
  },

  handleSuspendApp: function () {
    const dialogId =
      DialogActions.confirm("Suspend app by scaling to 0 instances?");

    DialogStore.handleUserResponse(dialogId, function () {
      AppsActions.scaleApp(this.state.appId, 0);
    }.bind(this));
  },

  handleRestartApp: function () {
    var appId = this.state.appId;

    const dialogId =
      DialogActions.confirm(`Restart app '${appId}'?`);

    DialogStore.handleUserResponse(dialogId, function () {
      AppsActions.restartApp(appId);
    });
  },

  handleDestroyApp: function () {
    var appId = this.state.appId;

    const dialogId =
      DialogActions.confirm(`Destroy app '${appId}'? This is irreversible.`);

    DialogStore.handleUserResponse(dialogId, function () {
      AppsActions.deleteApp(appId);
    });
  },

  handleResetDelay: function () {
    var appId = this.state.appId;
    QueueActions.resetDelay(appId);
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

  getTaskHealthMessage: function (taskId) {
    var task = AppsStore.getTask(this.state.appId, taskId);

    if (task === undefined) {
      return null;
    }

    var msg;

    switch (task.healthStatus) {
      case HealthStatus.HEALTHY:
        msg = "Healthy";
        break;
      case HealthStatus.UNHEALTHY:
        msg = this.getUnhealthyTaskMessage(task.healthCheckResults);
        break;
      default:
        msg = "Unknown";
        break;
    }

    return msg;
  },

  getResetDelayButton: function () {
    var state = this.state;
    var model = state.app;

    if (model.status !== AppStatus.DELAYED) {
      return null;
    }

    return (
      <button className="btn btn-lg btn-default"
          onClick={this.handleResetDelay}>
        Reset Delay
      </button>
    );
  },

  getControls: function () {
    var state = this.state;

    if (state.activeViewIndex !== 0) {
      return null;
    }

    return (
      <div className="header-btn">
        <button className="btn btn-lg btn-success"
            onClick={this.handleScaleApp}>
          Scale Application
        </button>
        <button className="btn btn-lg btn-default"
            onClick={this.handleRestartApp}>
          Restart
        </button>
        <button className="btn btn-lg btn-default"
            onClick={this.handleSuspendApp}
            disabled={state.app.instances < 1}>
          Suspend
        </button>
        <button className="btn btn-lg btn-danger"
            onClick={this.handleDestroyApp}>
          Destroy
        </button>
        {this.getResetDelayButton()}
      </div>
    );
  },

  getTaskDetailComponent: function () {
    var state = this.state;
    var model = state.app;

    var task = AppsStore.getTask(state.appId, state.activeTaskId);

    return (
      <TaskDetailComponent
        appId={state.appId}
        fetchState={state.fetchState}
        taskHealthMessage={this.getTaskHealthMessage(state.activeTaskId)}
        hasHealth={Object.keys(model.healthChecks).length > 0}
        task={task} />
    );
  },

  getAppDetails: function () {
    var state = this.state;
    var model = state.app;

    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={state.activeTabId}
          onTabClick={this.handleTabClick}
          tabs={state.tabs} >
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
      </TogglableTabsComponent>
    );
  },

  render: function () {
    var content;
    var state = this.state;
    var model = state.app;

    if (this.state.activeViewIndex === 0) {
      content = this.getAppDetails();
    } else if (this.state.activeViewIndex === 1) {
      content = this.getTaskDetailComponent();
    }

    var groupId = PathUtil.getGroupFromAppId(state.appId);
    var name = PathUtil.getAppName(state.appId);

    return (
      <div>
        <BreadcrumbComponent groupId={groupId}
          appId={state.appId}
          taskId={state.activeTaskId} />
        <div className="container-fluid">
          <div className="page-header">
            <h1>{name}</h1>
            <AppStatusComponent model={model} showSummary={true} />
            <div className="app-health-detail">
              <AppHealthComponent model={model} />
              <TaskHealthBreakdownComponent
                fields={["healthy", "unhealthy", "unknown"]}
                model={model} />
            </div>
            {this.getControls()}
          </div>
          {content}
        </div>
      </div>
    );
  }
});

module.exports = AppPageComponent;
