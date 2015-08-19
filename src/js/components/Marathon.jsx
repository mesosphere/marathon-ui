var config = require("../config/config");
var Util = require("../helpers/Util");

var Link = require("react-router").Link;
var Mousetrap = require("mousetrap");
require("mousetrap/plugins/global-bind/mousetrap-global-bind");
var React = require("react/addons");
var RouteHandler = require("react-router").RouteHandler;

var AboutModalComponent = require("../components/modals/AboutModalComponent");
var ChaosModalComponent = require("../components/modals/ChaosModalComponent");
var NewAppModalComponent = require("../components/NewAppModalComponent");
var NavTabsComponent = require("../components/NavTabsComponent");

var AppsActions = require("../actions/AppsActions");
var DeploymentActions = require("../actions/DeploymentActions");
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
      modalClass: null
    };
  },

  componentDidMount: function () {
    var router = this.context.router;

    this.onRouteChange();

    Mousetrap.bindGlobal("esc", function () {
      if (this.refs.modal != null) {
        this.handleModalDestroy();
      }
    }.bind(this));

    Mousetrap.bind("c", function () {
      router.transitionTo("newapp");
    }, "keyup");

    Mousetrap.bind("g a", function () {
      if (this.state.modalClass == null) {
        router.transitionTo("apps");
      }
    }.bind(this));

    Mousetrap.bind("g d", function () {
      if (this.state.modalClass == null) {
        router.transitionTo("deployments");
      }
    }.bind(this));

    Mousetrap.bind("g v", function () {
      Util.alert(`The UI version is ${config.version}`);
    });

    Mousetrap.bind("shift+,", function () {
      router.transitionTo("about");
    });

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
    var modalClass = null;

    if (modalQuery === "newapp") {
      modalClass = NewAppModalComponent;
    } else if (modalQuery === "about") {
      modalClass = AboutModalComponent;
    } else if (modalQuery === "chaos") {
      modalClass = ChaosModalComponent;
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
      modalClass: modalClass
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

  handleModalDestroy: function () {
    if (!this.state.modalClass) {
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
        onDestroy={this.handleModalDestroy}
        ref="modal" />
    );
  },

  getChaosModal: function () {
    return (
      <ChaosModalComponent
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
    var state = this.state;
    var router = this.context.router;

    if (state.modalClass === NewAppModalComponent) {
      modal = this.getNewAppModal();
    } else if (state.modalClass === AboutModalComponent) {
      modal = this.getAboutModal();
    } else if (state.modalClass === ChaosModalComponent) {
      modal = this.getChaosModal();
    }

    var logoPath = config.rootUrl + "img/marathon-logo.png";

    return (
      <div>
        <nav className="navbar navbar-inverse navbar-static-top" role="navigation">
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
