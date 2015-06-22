var _ = require("underscore");
var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");
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
    appVersionsFetchState: React.PropTypes.number.isRequired,
    destroyApp: React.PropTypes.func.isRequired,
    fetchAppVersions: React.PropTypes.func.isRequired,
    fetchTasks: React.PropTypes.func.isRequired,
    model: React.PropTypes.object.isRequired,
    onTasksKilled: React.PropTypes.func.isRequired,
    restartApp: React.PropTypes.func.isRequired,
    rollBackApp: React.PropTypes.func.isRequired,
    scaleApp: React.PropTypes.func.isRequired,
    suspendApp: React.PropTypes.func.isRequired,
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
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE,
      this.onAppChange);
    AppsStore.removeListener(AppsEvents.REQUEST_APP_ERROR,
      this.onAppRequestError);
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
    var model = this.props.model;
    var instancesString = util.prompt("Scale to how many instances?",
      model.get("instances"));
    // Clicking "Cancel" in a prompt returns either null or an empty String.
    // perform the action only if a value is submitted.
    if (instancesString != null && instancesString !== "") {
      var instances = parseInt(instancesString, 10);
      this.props.scaleApp(instances);
    }
  },

  getControls: function () {
    var state = this.state;

    if (state.activeViewIndex !== 0) {
      return null;
    }

    return (
      <div className="header-btn">
        <button className="btn btn-sm btn-default"
            onClick={this.props.suspendApp}
            disabled={state.app.instances < 1}>
          Suspend
        </button>
        <button className="btn btn-sm btn-default" onClick={this.scaleApp}>
          Scale
        </button>
        <button className="btn btn-sm btn-danger pull-right"
          onClick={this.props.destroyApp}>
          Destroy App
        </button>
        <button className="btn btn-sm btn-default pull-right"
          onClick={this.props.restartApp}>
          Restart App
        </button>
      </div>
    );
  },

  getTaskDetailComponent: function () {
    var state = this.state;
    var model = state.app;

    return (
      <TaskDetailComponent
        fetchState={state.fetchState}
        taskHealthMessage={this.getTaskHealthMessage(state.activeTaskId)}
        hasHealth={model.healthChecks > 0}
        task={lazy(this.state.app.tasks).findWhere({"id": state.activeTaskId})} />
    );
  },

  getAppDetails: function () {
    var state = this.state;
    var model = state.app;

    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={state.activeTabId}
          onTabClick={this.onTabClick}
          tabs={state.tabs} >
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(model.id)}>
          <TaskViewComponent
            tasks={model.tasks}
            fetchState={state.fetchState}
            fetchTasks={this.props.fetchTasks}
            getTaskHealthMessage={this.getTaskHealthMessage}
            hasHealth={model.healthChecks > 0}
            onTasksKilled={this.props.onTasksKilled} />
        </TabPaneComponent>
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(model.id) + "/configuration"}
          onActivate={this.props.fetchAppVersions} >

        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

/*
          <AppVersionListComponent
            app={model}
            fetchAppVersions={this.props.fetchAppVersions}
            fetchState={this.props.appVersionsFetchState}
            onRollback={this.props.rollBackApp} />
*/

  render: function () {
    var content;
    var state = this.state;
    var model = state.app;

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
          model={model} />
        <div className="container-fluid">
          <div className="page-header">
            <span className="h3 modal-title">{model.id}</span>
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
