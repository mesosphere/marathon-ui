var _ = require("underscore");
var config = require("../config/config");
var Mousetrap = require("mousetrap");
require("mousetrap/plugins/global-bind/mousetrap-global-bind");
var React = require("react/addons");
var States = require("../constants/States");
var AppCollection = require("../models/AppCollection");
var AppListComponent = require("../components/AppListComponent");
var AboutModalComponent = require("../components/modals/AboutModalComponent");
var AppPageComponent = require("../components/AppPageComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var NewAppModalComponent = require("../components/NewAppModalComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");
var NavTabsComponent = require("../components/NavTabsComponent");

var AppsActions = require("../actions/AppsActions");
var DeploymentActions = require("../actions/DeploymentActions");
var DeploymentEvents = require("../events/DeploymentEvents");
var DeploymentStore = require("../stores/DeploymentStore");
var util = require("../helpers/util");

var tabs = [
  {id: "apps", text: "Apps"},
  {id: "deployments", text: "Deployments"}
];

var Marathon = React.createClass({
  displayName: "Marathon",

  propTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      activeAppId: null,
      activeApp: null,
      activeAppView: null,
      activeTabId: tabs[0].id,
      collection: new AppCollection(),
      modalClass: null
    };
  },

  componentWillMount: function () {
    // TODO: That should be handled directly on the NavTabs
    DeploymentStore.on(DeploymentEvents.CHANGE, function () {
      if (tabs[1].badge !== DeploymentStore.deployments.length) {
        tabs[1].badge = DeploymentStore.deployments.length;
        this.forceUpdate();
      }
    }.bind(this));
  },

  componentDidMount: function () {
    var router = this.props.router;

    router.on("route:about", this.setRouteAbout);
    router.on("route:apps", this.setRouteApps);
    router.on("route:deployments",
      _.bind(this.activateTab, this, "deployments")
    );
    router.on("route:newapp", this.setRouteNewApp);

    Mousetrap.bindGlobal("esc", function () {
      if (this.refs.modal != null) {
        this.handleModalDestroy();
      }
    }.bind(this));

    Mousetrap.bind("c", function () {
      router.navigate("newapp", {trigger: true});
    }, "keyup");

    Mousetrap.bind("g a", function () {
      if (this.state.modalClass == null) {
        router.navigate("apps", {trigger: true});
      }
    }.bind(this));

    Mousetrap.bind("g d", function () {
      if (this.state.modalClass == null) {
        router.navigate("deployments", {trigger: true});
      }
    }.bind(this));

    Mousetrap.bind("#", function () {
      if (this.state.activeApp != null) {
        this.destroyApp();
      }
    }.bind(this));

    Mousetrap.bind("shift+,", function () {
      router.navigate("about", {trigger: true});
    });

    this.startPolling();
  },

  componentDidUpdate: function (prevProps, prevState) {
    /*eslint-disable eqeqeq */
    if (prevState.activeAppId != this.state.activeAppId ||
      prevState.activeTabId != this.state.activeTabId) {
      this.resetPolling();
    }
    /*eslint-enable eqeqeq */
  },

  componentWillUnmount: function () {
    this.stopPolling();
  },

  setRouteAbout: function () {
    this.setState({
      modalClass: AboutModalComponent
    });
  },

  setRouteApps: function (appid, view) {
    if (appid != null) {
      this.setState({
        activeAppId: appid,
        activeAppView: view,
        modalClass: null
      });
    } else {
      this.activateTab("apps");
    }
  },

  setRouteNewApp: function () {
    this.setState({
      modalClass: NewAppModalComponent
    });
  },

  handleAppCreate: function (appModel, options) {
    this.state.collection.create(appModel, options);
  },

  handleModalDestroy: function () {
    if (!this.state.modalClass) {
      return;
    }

    var router = this.props.router;
    var navigation = this.state.activeTabId;

    var activeApp = this.state.activeApp;
    if (activeApp != null) {
      navigation = "apps/" + encodeURIComponent(activeApp.get("id"));

      var activeAppView = this.state.activeAppView;
      if (activeAppView != null) {
        navigation += "/" + activeAppView;
      }
    }

    router.navigate(navigation, {trigger: true});
  },

  handleTasksKilled: function (options) {
    var instances;
    var app = this.state.activeApp;
    var _options = options || {};
    if (_options.scale) {
      instances = app.get("instances");
      app.set("instances", instances - 1);
      this.setState({appVersionsFetchState: States.STATE_LOADING});
      // refresh app versions
      this.fetchAppVersions();
    }
  },

  rollbackToAppVersion: function (version) {
    if (this.state.activeApp != null) {
      var app = this.state.activeApp;
      app.setVersion(version);
      app.save(
        null,
        {
          error: function (data, response) {
            var msg = response.responseJSON.message || response.statusText;
            util.alert("Could not update to chosen version: " + msg);
          },
          success: function () {
            // refresh app versions
            this.fetchAppVersions();
          }.bind(this)
        });
    }
  },

  startPolling: function () {
    if (this._interval == null) {
      this.poll();
      this._interval = setInterval(this.poll, config.updateInterval);
    }
  },

  stopPolling: function () {
    if (this._interval != null) {
      clearInterval(this._interval);
      this._interval = null;
    }
  },

  resetPolling: function () {
    this.stopPolling();
    this.startPolling();
  },

  poll: function () {
    var state = this.state;

    if (state.activeAppId != null) {
      AppsActions.requestApp(state.activeAppId);
    } else if (state.activeTabId === tabs[0].id) {
      AppsActions.requestApps();
    }

    // Deployments needs to be fetched on every poll,
    // because that data is also needed on the deployments tab badge.
    DeploymentActions.requestDeployments();
  },

  activateTab: function (id) {
    this.setState({
      activeTabId: id,
      activeApp: null,
      activeAppId: null,
      activeAppView: null,
      modalClass: null
    });
  },

  getAboutModal: function () {
    return (
      <AboutModalComponent
        onDestroy={this.handleModalDestroy}
        ref="modal" />
    );
  },

  getNewAppModal: function () {
    return (
      <NewAppModalComponent
        model={this.state.activeApp}
        onDestroy={this.handleModalDestroy}
        onCreate={this.handleAppCreate}
        ref="modal" />
    );
  },

  getAppPage: function () {
    var state = this.state;

    if (!state.activeAppId) {
      return null;
    }

    return (
      <AppPageComponent
        appId={state.activeAppId}
        onTasksKilled={this.handleTasksKilled}
        rollBackApp={this.rollbackToAppVersion}
        router={this.props.router}
        view={state.activeAppView} />
    );
  },

  getTabPane: function () {
    return (
      <TogglableTabsComponent activeTabId={this.state.activeTabId}
        className="container-fluid">
        <TabPaneComponent id="apps">
          <a href="#newapp" className="btn btn-success navbar-btn" >
            + New App
          </a>
          <AppListComponent router={this.props.router} />
        </TabPaneComponent>
        <TabPaneComponent id="deployments">
          <DeploymentsListComponent />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

  render: function () {
    var modal;
    var page;

    if (this.state.activeAppId != null) {
      page = this.getAppPage();
    } else {
      page = this.getTabPane();
    }

    if (this.state.modalClass === NewAppModalComponent) {
      modal = this.getNewAppModal();
    } else if (this.state.modalClass === AboutModalComponent) {
      modal = this.getAboutModal();
    }

    return (
      <div>
        <nav className="navbar navbar-inverse navbar-static-top" role="navigation">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href={window.location.pathname}>
                <img width="160" height="27" alt="Marathon" src="img/marathon-logo.png" />
              </a>
            </div>
            <NavTabsComponent
              activeTabId={this.state.activeTabId}
              className="navbar-nav nav-tabs-unbordered"
              tabs={tabs} />
            <ul className="nav navbar-nav navbar-right">
              <li>
                <a href="#about">
                  About
                </a>
              </li>
              <li>
                <a href="https://mesosphere.github.io/marathon/docs/" target="_blank">
                  Docs ⇗
                </a>
              </li>
            </ul>
          </div>
        </nav>
        {page}
        {modal}
      </div>
    );
  }
});

module.exports = Marathon;
