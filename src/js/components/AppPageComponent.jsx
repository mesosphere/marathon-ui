var React = require("react/addons");

var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var AppsStore = require("../stores/AppsStore");
var AppBreadcrumbsComponent = require("../components/AppBreadcrumbsComponent");
var AppStatus = require("../constants/AppStatus");
var AppStatusComponent = require("../components/AppStatusComponent");
var AppVersionsActions = require("../actions/AppVersionsActions");
var AppLastTaskFailureComponent = require("../components/AppLastTaskFailureComponent");
var AppVersionListComponent = require("../components/AppVersionListComponent");
var HealthStatus = require("../constants/HealthStatus");
var States = require("../constants/States");
var TabPaneComponent = require("../components/TabPaneComponent");
var TaskDetailComponent = require("../components/TaskDetailComponent");
var TaskViewComponent = require("../components/TaskViewComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");
var Util = require("../helpers/Util");
var QueueActions = require("../actions/QueueActions");
var QueueEvents = require("../events/QueueEvents");
var QueueStore = require("../stores/QueueStore");

var tabsTemplate = [
  {id: "apps/:appId", text: "Tasks"},
  {id: "apps/:appId/configuration", text: "Configuration"},
  {
    id: "apps/:appId/last-task-failure",
    text: "Last Task Failure",
    hidden: true
  }
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

      if (tab.id === "apps/:appId/last-task-failure") {
        tab.hidden = app.lastTaskFailure == null;
      }

      return {
        id: id,
        text: tab.text,
        hidden: tab.hidden
      };
    });

    if (view === "configuration") {
      activeTabId += "/configuration";
    } else if (view === "last-task-failure") {
      activeTabId += "/last-task-failure";
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
    var tabs = state.tabs;

    tabs = tabs.map(function (tab) {
      var tabId = `apps/${encodeURIComponent(state.appId)}/last-task-failure`;
      if (tab.id === tabId) {
        tab.hidden = app.lastTaskFailure == null;
      }
      return tab;
    });

    this.setState({
      app: app,
      fetchState: States.STATE_SUCCESS,
      tabs: tabs
    });

    if (this.state.view === "configuration") {
      AppVersionsActions.requestAppVersions(this.state.appId);
    }
  },

  onAppRequestError: function () {
    this.setState({
      fetchState: States.STATE_ERROR
    });
  },

  onScaleAppError: function (errorMessage) {
    Util.alert("Not scaling: " + (errorMessage.message || errorMessage));
  },

  onRestartAppError: function (errorMessage) {
    Util.alert("Error restarting app: " +
      (errorMessage.message || errorMessage));
  },

  onDeleteAppError: function (errorMessage) {
    Util.alert("Error destroying app: " +
      (errorMessage.message || errorMessage));
  },

  onDeleteAppSuccess: function () {
    this.context.router.transitionTo("apps");
  },

  onResetDelaySuccess: function () {
    Util.alert("Delay reset succesfully");
  },

  onResetDelayError: function (errorMessage) {
    Util.alert("Error resetting delay on app: " +
      (errorMessage.message || errorMessage));
  },

  handleTabClick: function (id) {
    this.setState({
      activeTabId: id
    });
  },

  handleScaleApp: function () {
    var model = this.state.app;

    var instancesString = Util.prompt("Scale to how many instances?",
      model.instances);

    if (instancesString != null && instancesString !== "") {
      var instances = parseInt(instancesString, 10);

      AppsActions.scaleApp(this.state.appId, instances);
    }
  },

  handleSuspendApp: function () {
    if (Util.confirm("Suspend app by scaling to 0 instances?")) {
      AppsActions.scaleApp(this.state.appId, 0);
    }
  },

  handleRestartApp: function () {
    var appId = this.state.appId;
    if (Util.confirm("Restart app '" + appId + "'?")) {
      AppsActions.restartApp(appId);
    }
  },

  handleDestroyApp: function () {
    var appId = this.state.appId;
    if (Util.confirm("Destroy app '" + appId +
      "'?\nThis is irreversible.")) {
      AppsActions.deleteApp(appId);
    }
  },

  handleResetDelay: function () {
    var appId = this.state.appId;
    QueueActions.resetDelay(appId);
  },

  getUnhealthyTaskMessage: function (healthCheckResults = []) {
    return healthCheckResults.map((healthCheck, index) => {
      if (healthCheck && !healthCheck.alive) {
        var failedCheck = this.state.app.healthChecks[index];

        var protocol = failedCheck.protocol
          ? `${failedCheck.protocol} `
          : "";
        var host = this.state.app.host || "";
        var path = failedCheck.path || "";
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
      <button className="btn btn-sm btn-default pull-right"
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
        <button className="btn btn-sm btn-default"
            onClick={this.handleSuspendApp}
            disabled={state.app.instances < 1}>
          Suspend
        </button>
        <button className="btn btn-sm btn-default"
            onClick={this.handleScaleApp}>
          Scale
        </button>
        <button className="btn btn-sm btn-danger pull-right"
            onClick={this.handleDestroyApp}>
          Destroy App
        </button>
        <button className="btn btn-sm btn-default pull-right"
            onClick={this.handleRestartApp}>
          Restart App
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
        hasHealth={model.healthChecks > 0}
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
            hasHealth={model.healthChecks > 0}
            tasks={model.tasks} />
        </TabPaneComponent>
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(state.appId) + "/configuration"}>
          <AppVersionListComponent appId={state.appId} />
        </TabPaneComponent>
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(state.appId) + "/last-task-failure"}>
          <AppLastTaskFailureComponent appId={state.appId} />
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

    return (
      <div>
        <AppBreadcrumbsComponent
          activeTaskId={state.activeTaskId}
          activeViewIndex={state.activeViewIndex}
          appId={state.appId} />
        <div className="container-fluid">
          <div className="page-header">
            <span className="h3 modal-title">{state.appId}</span>
            <ul className="list-inline list-inline-subtext">
              <li>
                <AppStatusComponent model={model} />
              </li>
            </ul>
            {this.getControls()}
          </div>
          {content}
        </div>
      </div>
    );
  }
});

module.exports = AppPageComponent;
