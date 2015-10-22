var config = require("../config/config");

var Link = require("react-router").Link;
var Mousetrap = require("mousetrap");
require("mousetrap/plugins/global-bind/mousetrap-global-bind");
var React = require("react/addons");
var RouteHandler = require("react-router").RouteHandler;

var AboutModalComponent = require("../components/modals/AboutModalComponent");
var AppModalComponent = require("../components/modals/AppModalComponent");
var DialogsComponent = require("../components/DialogsComponent");
var EditAppModalComponent =
  require("../components/modals/EditAppModalComponent");
var HelpModalComponent = require("../components/modals/HelpModalComponent");
var NavTabsComponent = require("../components/NavTabsComponent");

var AppsActions = require("../actions/AppsActions");
var DeploymentActions = require("../actions/DeploymentActions");
var DialogActions = require("../actions/DialogActions");
var QueueActions = require("../actions/QueueActions");

var tabs = require("../constants/tabs");

var Marathon = React.createClass({
  displayName: "Marathon",

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      activeAppId: null,
      activeAppView: null,
      activeTabId: null,
      modal: null
    };
  },

  componentDidMount: function () {
    this.onRouteChange();

    this.bindKeyboardShortcuts();

    this.startPolling();
  },

  componentWillReceiveProps: function () {
    this.onRouteChange();
  },

  onRouteChange: function () {
    var router = this.context.router;

    var params = router.getCurrentParams();
    var path = router.getCurrentPathname();
    var modalQuery = router.getCurrentQuery().modal;
    var modal = null;

    if (modalQuery === "new-app") {
      modal = this.getNewAppModal();
    } else if (modalQuery === "about") {
      modal = this.getAboutModal();
    } else if (modalQuery === "help") {
      modal = this.getHelpModal();
    } else if (modalQuery != null && modalQuery.indexOf("edit-app--") > -1) {
      let [, appId, appVersion] = modalQuery.split("--");
      modal = this.getEditAppModal(decodeURIComponent(appId), appVersion);
    }

    var appId = params.appId;
    if (appId != null) {
      appId = decodeURIComponent(appId);
    }

    var view = params.view;
    if (view != null) {
      view = decodeURIComponent(view);
    }

    var activeTabId = !this.context.router.isActive("404")
      ? tabs[0].id
      : null;

    if (tabs.find(function (tab) {
      return tab.id === path;
    })) {
      activeTabId = path;
    }

    this.setState({
      activeAppId: appId,
      activeAppView: view,
      activeTabId: activeTabId,
      modal: modal
    });
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

  bindKeyboardShortcuts: function () {
    var router = this.context.router;

    Mousetrap.bindGlobal("esc", function () {
      if (this.state.modal != null) {
        this.handleModalDestroy();
      }
      DialogActions.dismissLatest();
    }.bind(this));

    Mousetrap.bind("c", function () {
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "new-app"});
    }, "keyup");

    Mousetrap.bind("g a", function () {
      if (this.state.modal == null) {
        router.transitionTo("apps");
      }
    }.bind(this));

    Mousetrap.bind("g d", function () {
      if (this.state.modal == null) {
        router.transitionTo("deployments");
      }
    }.bind(this));

    Mousetrap.bind("g v", function () {
      DialogActions.alert(`The UI version is ${config.version}`);
    });

    Mousetrap.bind("shift+,", function () {
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "about"});
    });

    Mousetrap.bind("?", function () {
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "help"});
    });
  },

  handleModalDestroy: function () {
    if (!this.state.modal) {
      return;
    }

    var router = this.context.router;

    router.transitionTo(router.getCurrentPathname());
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
      QueueActions.requestQueue();
    } else if (state.activeTabId === tabs[0].id) {
      AppsActions.requestApps();
      QueueActions.requestQueue();
    }

    // Deployments needs to be fetched on every poll,
    // because that data is also needed on the deployments tab badge.
    DeploymentActions.requestDeployments();
  },

  getAboutModal: function () {
    return (
      <AboutModalComponent
        onDestroy={this.handleModalDestroy} />
    );
  },

  getHelpModal: function () {
    return (
      <HelpModalComponent
        onDestroy={this.handleModalDestroy} />
    );
  },

  getNewAppModal: function () {
    return (
      <AppModalComponent
        onDestroy={this.handleModalDestroy} />
    );
  },

  getEditAppModal: function (appId, appVersion) {
    return (
      <EditAppModalComponent
        appId={appId}
        appVersion={appVersion}
        onDestroy={this.handleModalDestroy} />
    );
  },

  render: function () {
    var state = this.state;
    var router = this.context.router;

    var logoPath = config.rootUrl + "img/marathon-logo.png";

    return (
      <div>
        <nav className="navbar navbar-inverse navbar-static-top"
            role="navigation">
          <div className="container-fluid">
            <div className="navbar-header">
              <a className="navbar-brand" href={window.location.pathname}>
                <img width="160" height="27" alt="Marathon" src={logoPath} />
              </a>
            </div>
            <NavTabsComponent
              activeTabId={state.activeTabId}
              className="navbar-nav nav-tabs-unbordered"
              tabs={tabs} />
            <ul className="nav navbar-nav navbar-right">
              <li>
                <Link
                    to={router.getCurrentPathname()}
                    query={{modal: "about"}}>
                  About
                </Link>
              </li>
              <li>
                <a href="/help"
                  target="_blank">
                  API Reference
                </a>
              </li>
              <li>
                <a href="https://mesosphere.github.io/marathon/docs/"
                    target="_blank">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <RouteHandler />
        {state.modal}
        <DialogsComponent />
      </div>
    );
  }
});

module.exports = Marathon;
