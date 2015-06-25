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
    destroyApp: React.PropTypes.func.isRequired,
    fetchTasks: React.PropTypes.func.isRequired,
    onTasksKilled: React.PropTypes.func.isRequired,
    restartApp: React.PropTypes.func.isRequired,
    rollBackApp: React.PropTypes.func.isRequired,
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
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE,
      this.onAppChange);
    AppsStore.removeListener(AppsEvents.REQUEST_APP_ERROR,
      this.onAppRequestError);
    AppsStore.removeListener(AppsEvents.SCALE_APP_ERROR,
      this.onScaleAppError);
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

  onTabClick: function (id) {
    this.setState({
      activeTabId: id
    });
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

  scaleApp: function () {
    var model = this.state.app;

    var instancesString = util.prompt("Scale to how many instances?",
      model.instances);

    if (instancesString != null && instancesString !== "") {
      var instances = parseInt(instancesString, 10);

      AppsActions.scaleApp(this.props.appId, instances);
    }
  },

  suspendApp: function () {
    if (util.confirm("Suspend app by scaling to 0 instances?")) {
      AppsActions.scaleApp(this.props.appId, 0);
    }
  },

  getControls: function () {
    var state = this.state;
    var props = this.props;

    if (state.activeViewIndex !== 0) {
      return null;
    }

    return (
      <div className="header-btn">
        <button className="btn btn-sm btn-default"
            onClick={this.suspendApp}
            disabled={state.app.instances < 1}>
          Suspend
        </button>
        <button className="btn btn-sm btn-default" onClick={this.scaleApp}>
          Scale
        </button>
        <button className="btn btn-sm btn-danger pull-right"
          onClick={props.destroyApp}>
          Destroy App
        </button>
        <button className="btn btn-sm btn-default pull-right"
          onClick={props.restartApp}>
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
          onTabClick={this.onTabClick}
          tabs={state.tabs} >
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(props.appId)}>
          <TaskViewComponent
            tasks={model.tasks}
            fetchState={state.fetchState}
            fetchTasks={props.fetchTasks}
            getTaskHealthMessage={this.getTaskHealthMessage}
            hasHealth={model.healthChecks > 0}
            onTasksKilled={props.onTasksKilled} />
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
