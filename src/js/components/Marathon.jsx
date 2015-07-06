var config = require("../config/config");
var Mousetrap = require("mousetrap");
require("mousetrap/plugins/global-bind/mousetrap-global-bind");
var React = require("react/addons");
var RouteHandler = require("react-router").RouteHandler;
var Navigation = require("react-router").Navigation;
var State = require("react-router").State;

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

var tabs = [
  {id: "/apps", text: "Apps"},
  {id: "/deployments", text: "Deployments"}
];

var Marathon = React.createClass({
  displayName: "Marathon",

  mixins: [
    Navigation,
    State
  ],

  propTypes: {
    params: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      activeAppId: null,
      activeAppView: null,
      activeTabId: tabs[0].id,
      modalClass: null
    };
  },

  componentDidMount: function () {
    this.onRouteChange(this.props);

    /*
    router.on("route:about", this.setRouteAbout);
    router.on("route:apps", this.setRouteApps);
    router.on("route:deployments",
      _.bind(this.activateTab, this, "deployments")
    );
    router.on("route:newapp", this.setRouteNewApp);
    */

    Mousetrap.bindGlobal("esc", function () {
      if (this.refs.modal != null) {
        this.handleModalDestroy();
      }
    }.bind(this));

    Mousetrap.bind("c", function () {
      this.transitionTo("newapp");
    }, "keyup");

    Mousetrap.bind("g a", function () {
      if (this.state.modalClass == null) {
        this.transitionTo("apps");
      }
    }.bind(this));

    Mousetrap.bind("g d", function () {
      if (this.state.modalClass == null) {
        this.transitionTo("deployments");
      }
    }.bind(this));

    Mousetrap.bind("shift+,", function () {
      this.transitionTo("about");
    });

    this.startPolling();
  },

  componentWillReceiveProps: function (nextProps) {
    this.onRouteChange(nextProps);
  },

  onRouteChange: function (props) {
    var params = props.state.params || {};
    var appId = params.appid != null ?
      decodeURIComponent(params.appid) :
      params.appid;
    var view = params.view != null ?
      decodeURIComponent(params.view) :
      params.view;

    var activeTabId = tabs[0].id;
    var path = this.getPath();

    if (tabs.find(function (tab) {
      return tab.id === path;
    })) {
      activeTabId = path;
    }

    this.setState({
      activeAppId: appId,
      activeAppView: view,
      activeTabId: activeTabId,
      modalClass: null
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

  handleModalDestroy: function () {
    if (!this.state.modalClass) {
      return;
    }

    var navigation = this.state.activeTabId;

    var activeAppId = this.state.activeAppId;
    if (activeAppId != null) {
      navigation = "apps/" + encodeURIComponent(activeAppId);

      var activeAppView = this.state.activeAppView;
      if (activeAppView != null) {
        navigation += "/" + activeAppView;
      }
    }

    this.transitionTo(navigation);
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
        onDestroy={this.handleModalDestroy}
        ref="modal" />
    );
  },

  render: function () {
    var modal;

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
        <RouteHandler />
        {modal}
      </div>
    );
  }
});

module.exports = Marathon;
