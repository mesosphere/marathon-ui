var _ = require("underscore");
var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var AppsStore = require("../stores/AppsStore");
var AppStatus = require("../constants/AppStatus");
var AppBreadcrumbsComponent = require("../components/AppBreadcrumbsComponent");
var AppVersionListComponent = require("../components/AppVersionListComponent");
var HealthStatus = require("../constants/HealthStatus");
var States = require("../constants/States");
var TabPaneComponent = require("../components/TabPaneComponent");
var TaskDetailComponent = require("../components/TaskDetailComponent");
var TaskViewComponent = require("../components/TaskViewComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");
var util = require("../helpers/util");

var tabsTemplate = [
  {id: "apps/:appid", text: "Tasks"},
  {id: "apps/:appid/configuration", text: "Configuration"}
];

var statusNameMapping = {};
statusNameMapping[AppStatus.RUNNING] = "Running";
statusNameMapping[AppStatus.DEPLOYING] = "Deploying";
statusNameMapping[AppStatus.SUSPENDED] = "Suspended";

var AppPageComponent = React.createClass({
  displayName: "AppPageComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    rollBackApp: React.PropTypes.func.isRequired,
    router: React.PropTypes.object.isRequired,
    view: React.PropTypes.string
  },

  getInitialState: function () {
    var activeTabId;
    var appId = this.props.appId;

    var tabs = _.map(tabsTemplate, function (tab) {
      var id = tab.id.replace(":appid", encodeURIComponent(appId));
      if (activeTabId == null) {
        activeTabId = id;
      }

      return {
        id: id,
        text: tab.text
      };
    });

    return {
      activeViewIndex: 0,
      activeTabId: activeTabId,
      activeTaskId: null,
      app: AppsStore.getCurrentApp(appId),
      tabs: tabs,
      fetchState: States.STATE_LOADING
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppChange);
    AppsStore.on(AppsEvents.REQUEST_APP_ERROR, this.onAppRequestError);
    AppsStore.on(AppsEvents.SCALE_APP_ERROR, this.onScaleAppError);
    AppsStore.on(AppsEvents.RESTART_APP_ERROR, this.onRestartAppError);
    AppsStore.on(AppsEvents.DELETE_APP_ERROR, this.onDeleteAppError);
    AppsStore.on(AppsEvents.DELETE_APP, this.onDeleteAppSuccess);
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
  },

  componentWillReceiveProps: function (nextProps) {
    var view = nextProps.view;
    var activeTabId = "apps/" + encodeURIComponent(this.props.appId);
    var activeViewIndex = 0;
    var activeTaskId = null;

    if (view === "configuration") {
      activeTabId += "/configuration";
    } else if (view != null) {
      activeTaskId = view;
      activeViewIndex = 1;
    }

    this.setState({
      activeTabId: activeTabId,
      activeTaskId: activeTaskId,
      activeViewIndex: activeViewIndex
    });
  },

  onAppChange: function () {
    this.setState({
      app: AppsStore.getCurrentApp(this.props.appId),
      fetchState: States.STATE_SUCCESS
    });
  },

  onAppRequestError: function () {
    this.setState({
      fetchState: States.STATE_ERROR
    });
  },

  onScaleAppError: function (errorMessage) {
    util.alert("Not scaling: " + (errorMessage.message || errorMessage));
  },

  onRestartAppError: function (errorMessage) {
    util.alert("Error restarting app: " +
      (errorMessage.message || errorMessage));
  },

  onDeleteAppError: function (errorMessage) {
    util.alert("Error destroying app: " +
      (errorMessage.message || errorMessage));
  },

  onDeleteAppSuccess: function () {
    this.props.router.navigate("apps", {trigger: true});
  },

  handleTabClick: function (id) {
    this.setState({
      activeTabId: id
    });
  },

  handleScaleApp: function () {
    var model = this.state.app;

    var instancesString = util.prompt("Scale to how many instances?",
      model.instances);

    if (instancesString != null && instancesString !== "") {
      var instances = parseInt(instancesString, 10);

      AppsActions.scaleApp(this.props.appId, instances);
    }
  },

  handleSuspendApp: function () {
    if (util.confirm("Suspend app by scaling to 0 instances?")) {
      AppsActions.scaleApp(this.props.appId, 0);
    }
  },

  handleRestartApp: function () {
    var appId = this.props.appId;
    if (util.confirm("Restart app '" + appId + "'?")) {
      AppsActions.restartApp(appId);
    }
  },

  handleDestroyApp: function () {
    var appId = this.props.appId;
    if (util.confirm("Destroy app '" + appId +
      "'?\nThis is irreversible.")) {
      AppsActions.deleteApp(appId);
    }
  },

  getTaskHealthMessage: function (taskId) {
    var task = lazy(this.state.app.tasks).findWhere({"id": taskId});

    if (task === undefined) {
      return null;
    }

    var model = this.state.app;
    var msg;

    switch (task.healthStatus) {
      case HealthStatus.HEALTHY:
        msg = "Healthy";
        break;
      case HealthStatus.UNHEALTHY:
        var healthCheckResults = task.healthCheckResults;
        if (healthCheckResults != null) {
          msg = lazy(healthCheckResults).map(function (hc, index) {
            if (hc && !hc.alive) {
              var failedCheck = model.healthChecks[index];
              return "Warning: Health check '" +
                (failedCheck.protocol ? failedCheck.protocol + " " : "") +
                (model.host ? model.host : "") +
                (failedCheck.path ? failedCheck.path : "") + "'" +
                (hc.lastFailureCause ?
                  " returned with status: '" + hc.lastFailureCause + "'" :
                  " failed") +
                ".";
            }
          }).value();
        }
        break;
      default:
        msg = "Unknown";
        break;
    }

    return msg;
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
        <button className="btn btn-sm btn-default" onClick={this.handleScaleApp}>
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
      </div>
    );
  },

  getTaskDetailComponent: function () {
    var state = this.state;
    var model = state.app;

    var task = lazy(model.tasks).findWhere({"id": state.activeTaskId});

    if (task == null) {
      return null;
    }

    return (
      <TaskDetailComponent
        fetchState={state.fetchState}
        taskHealthMessage={this.getTaskHealthMessage(state.activeTaskId)}
        hasHealth={model.healthChecks > 0}
        task={task} />
    );
  },

  getAppDetails: function () {
    var state = this.state;
    var model = state.app;
    var props = this.props;

    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={state.activeTabId}
          onTabClick={this.handleTabClick}
          tabs={state.tabs} >
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(props.appId)}>
          <TaskViewComponent
            appId={props.appId}
            fetchState={state.fetchState}
            getTaskHealthMessage={this.getTaskHealthMessage}
            hasHealth={model.healthChecks > 0}
            tasks={model.tasks} />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

  render: function () {
    var content;
    var state = this.state;
    var model = state.app;
    var props = this.props;

    var statusClassSet = classNames({
      "text-warning": model.deployments.length > 0
    });

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
          appId={props.appId} />
        <div className="container-fluid">
          <div className="page-header">
            <span className="h3 modal-title">{props.appId}</span>
            <ul className="list-inline list-inline-subtext">
              <li>
                <span className={statusClassSet}>
                  {statusNameMapping[model.status]}
                </span>
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
