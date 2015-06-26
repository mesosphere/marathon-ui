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

var DeploymentActions = require("../actions/DeploymentActions");
var DeploymentEvents = require("../events/DeploymentEvents");
var DeploymentStore = require("../stores/DeploymentStore");
var Util = require("../helpers/Util");

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
      appVersionsFetchState: States.STATE_LOADING,
      collection: new AppCollection(),
      fetchState: States.STATE_LOADING,
      modalClass: null,
      tasksFetchState: States.STATE_LOADING
    };
  },

  componentWillMount: function () {
    // TODO: That should be handled directly on the NavTabs
    DeploymentStore.on(DeploymentEvents.CHANGE, function () {
      tabs[1].badge = DeploymentStore.deployments.length;
      this.forceUpdate();
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
    if (prevState.activeApp != this.state.activeApp ||
      prevState.activeTabId != this.state.activeTabId) {
      this.poll();
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
        // activeApp could be undefined here, if this route is triggered on
        // page load, because the collection is not ready.
        activeApp: this.state.collection.get(appid),
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

  fetchApps: function () {
    this.state.collection.fetch({
      error: function () {
        this.setState({fetchState: States.STATE_ERROR});
      }.bind(this),
      success: function () {
        this.setState({
          fetchState: States.STATE_SUCCESS,
          activeApp: this.state.collection.get(this.state.activeAppId)
        });
      }.bind(this)
    });
  },

  fetchAppVersions: function () {
    if (this.state.activeApp != null) {
      this.state.activeApp.versions.fetch({
        error: function () {
          this.setState({appVersionsFetchState: States.STATE_ERROR});
        }.bind(this),
        success: function () {
          this.setState({appVersionsFetchState: States.STATE_SUCCESS});
        }.bind(this)
      });
    }
  },

  fetchTasks: function () {
    if (this.state.activeApp != null) {
      this.state.activeApp.tasks.fetch({
        error: function () {
          this.setState({tasksFetchState: States.STATE_ERROR});
        }.bind(this),
        success: function (collection, response) {
          // update changed attributes in app
          this.state.activeApp.update(response.app);
          this.setState({tasksFetchState: States.STATE_SUCCESS});
        }.bind(this)
      });
    }
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

  destroyApp: function () {
    var app = this.state.activeApp;
    if (Util.confirm("Destroy app '" + app.id + "'?\nThis is irreversible.")) {
      app.destroy({
        error: function (data, response) {
          var msg = response.responseJSON.message || response.statusText;
          Util.alert("Error destroying app '" + app.id + "': " + msg);
        },
        success: function () {
          this.props.router.navigate("apps", {trigger: true});
        }.bind(this),
        wait: true
      });
    }
  },

  restartApp: function () {
    var app = this.state.activeApp;
    if (Util.confirm("Restart app '" + app.id + "'?")) {
      app.restart({
        error: function (data, response) {
          var msg = response.responseJSON.message || response.statusText;
          Util.alert("Error restarting app '" + app.id + "': " + msg);
        },
        wait: true
      });
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
            Util.alert("Could not update to chosen version: " + msg);
          },
          success: function () {
            // refresh app versions
            this.fetchAppVersions();
          }.bind(this)
        });
    }
  },

  scaleApp: function (instances) {
    if (this.state.activeApp != null) {
      var app = this.state.activeApp;
      app.save(
        {instances: instances},
        {
          error: function (data, response) {
            var msg = response.responseJSON.message || response.statusText;
            Util.alert("Not scaling: " + msg);
          },
          success: function () {
            // refresh app versions
            this.fetchAppVersions();
          }.bind(this)
        }
      );

      if (app.validationError != null) {
        // If the model is not valid, revert the changes to prevent the UI
        // from showing an invalid state.
        app.update(app.previousAttributes());
        Util.alert("Not scaling: " + app.validationError[0].message);
      }
    }
  },

  suspendApp: function () {
    if (Util.confirm("Suspend app by scaling to 0 instances?")) {
      this.state.activeApp.suspend({
        error: function (data, response) {
          var msg = response.responseJSON.message || response.statusText;
          Util.alert("Could not suspend: " + msg);
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

  poll: function () {
    if (this.state.activeApp) {
      this.fetchTasks();
    } else if (this.state.activeTabId === tabs[0].id) {
      this.fetchApps();
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
    var activeApp = this.state.collection.get(this.state.activeAppId);
    if (!activeApp) {
      return null;
    }

    return (
      <AppPageComponent
        appVersionsFetchState={this.state.appVersionsFetchState}
        destroyApp={this.destroyApp}
        fetchTasks={this.fetchTasks}
        fetchAppVersions={this.fetchAppVersions}
        model={this.state.activeApp}
        onTasksKilled={this.handleTasksKilled}
        restartApp={this.restartApp}
        rollBackApp={this.rollbackToAppVersion}
        scaleApp={this.scaleApp}
        suspendApp={this.suspendApp}
        tasksFetchState={this.state.tasksFetchState}
        view={this.state.activeAppView} />
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
          <AppListComponent
            collection={this.state.collection}
            fetchState={this.state.fetchState}
            router={this.props.router} />
        </TabPaneComponent>
        <TabPaneComponent
            id="deployments"
            onActivate={this.fetchAppVersions} >
          <DeploymentsListComponent />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  },

  render: function () {
    var modal;
    var page;

    if (this.state.activeApp != null) {
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
