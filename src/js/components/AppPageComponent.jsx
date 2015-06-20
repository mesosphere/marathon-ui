var _ = require("underscore");
var classNames = require("classnames");
var React = require("react/addons");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");
var AppBreadcrumbsComponent = require("../components/AppBreadcrumbsComponent");
var AppVersionListComponent = require("../components/AppVersionListComponent");
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
    fetchState: React.PropTypes.number.isRequired,
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
      app: {},
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
      this.onAppsRequestError);
  },

  componentWillReceiveProps: function (nextProps) {
    var view = nextProps.view;
    var activeTabId = "apps/" + encodeURIComponent(this.props.appId);
    console.log("VIEW", view); // TODO
    var activeTask = null; // TODO this.props.model.tasks.get(view);
    var activeViewIndex = 0;

    if (view === "configuration") {
      activeTabId += "/configuration";
    }

    if (view != null && activeTask == null) {
      activeTask = this.state.activeTask;
    }

    if (activeTask != null) {
      activeViewIndex = 1;
    }

    this.setState({
      activeTabId: activeTabId,
      activeTask: activeTask,
      activeViewIndex: activeViewIndex
    });
  },

  onAppChange: function () {
    this.setState({
      app: AppsStore.currentApp,
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

    if (this.state.activeViewIndex !== 0) {
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
    var model = state.model;

    return (
      <TaskDetailComponent
        fetchState={state.fetchState}
        taskHealthMessage={model.formatTaskHealthMessage(this.state.activeTask)}
        hasHealth={model.hasHealth()}
        task={this.state.activeTask} />
    );
  },

  getAppDetails: function () {
    var model = this.state.app;

    return (
      <TogglableTabsComponent className="page-body page-body-no-top"
          activeTabId={this.state.activeTabId}
          onTabClick={this.onTabClick}
          tabs={this.state.tabs} >
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(model.id)}>
          <TaskViewComponent
            collection={model.tasks}
            fetchState={state.fetchState}
            fetchTasks={this.props.fetchTasks}
            formatTaskHealthMessage={model.formatTaskHealthMessage}
            hasHealth={model.hasHealth()}
            onTasksKilled={this.props.onTasksKilled} />
        </TabPaneComponent>
        <TabPaneComponent
          id={"apps/" + encodeURIComponent(model.id) + "/configuration"}
          onActivate={this.props.fetchAppVersions} >
          <AppVersionListComponent
            app={model}
            fetchAppVersions={this.props.fetchAppVersions}
            fetchState={this.props.appVersionsFetchState}
            onRollback={this.props.rollBackApp} />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

  render: function () {
    var content;
    var model = this.state.app;
    var statusClassSet = classNames({
      "text-warning": model.isDeploying()
    });

    if (this.state.activeViewIndex === 0) {
      content = this.getAppDetails();
    } else if (this.state.activeViewIndex === 1) {
      content = this.getTaskDetailComponent();
    }

    return (
      <div>
        <AppBreadcrumbsComponent
          activeTask={this.state.activeTask}
          activeViewIndex={this.state.activeViewIndex}
          model={model} />
        <div className="container-fluid">
          <div className="page-header">
            <span className="h3 modal-title">{model.id}</span>
            <ul className="list-inline list-inline-subtext">
              <li>
                <span className={statusClassSet}>
                  {model.getStatus()}
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
