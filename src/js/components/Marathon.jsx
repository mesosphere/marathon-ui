import React from "react/addons";
import {Link, RouteHandler} from "react-router";
import Mousetrap from "mousetrap";
import "mousetrap/plugins/global-bind/mousetrap-global-bind";

import config from "../config/config";
import classNames from "classnames";

import AppListFilterComponent from "../components/AppListFilterComponent";
import AboutModalComponent from "../components/modals/AboutModalComponent";
import AppModalComponent from "../components/modals/AppModalComponent";
import DialogsComponent from "../components/DialogsComponent";
import EditAppModalComponent from "../components/modals/EditAppModalComponent";
import HelpModalComponent from "../components/modals/HelpModalComponent";
import NavTabsComponent from "../components/NavTabsComponent";
import PopoverComponent from "./PopoverComponent";

import AppsActions from "../actions/AppsActions";
import DeploymentActions from "../actions/DeploymentActions";
import DialogActions from "../actions/DialogActions";
import QueueActions from "../actions/QueueActions";
import AppsFiltersActions from "../actions/AppsFiltersActions";

import tabs from "../constants/tabs";

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
      filters: null,
      helpMenuVisible: false,
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
    var query = router.getCurrentQuery();
    var modalQuery = query.modal;
    var modal = null;

    if (modalQuery === "new-app") {
      modal = this.getNewAppModal(query.groupId);
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
      modal: modal,
    });
  },

  componentDidUpdate: function (prevProps, prevState) {
    /* eslint-disable eqeqeq */
    if (prevState.activeAppId != this.state.activeAppId ||
      prevState.activeTabId != this.state.activeTabId) {
      this.resetPolling();
    }
    /* eslint-enable eqeqeq */
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
      DialogActions.dismissLatestDialog();
    }.bind(this));

    Mousetrap.bind("c", function () {
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "new-app"});
    }, "keypress");

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
      DialogActions.alert({message:`You're running version ${config.version}.`,
        title: "Marathon UI"});
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
    if (this.interval == null) {
      this.poll();
      this.interval = setInterval(this.poll, config.updateInterval);
    }
  },

  stopPolling: function () {
    if (this.interval != null) {
      clearInterval(this.interval);
      this.interval = null;
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
      <HelpModalComponent onDestroy={this.handleModalDestroy} />
    );
  },

  getNewAppModal: function (groupId) {
    var app = groupId != null
      ? {id: groupId}
      : null;

    return (
      <AppModalComponent app={app} onDestroy={this.handleModalDestroy} />
    );
  },

  getEditAppModal: function (appId, appVersion) {
    return (
      <EditAppModalComponent appId={appId}
        appVersion={appVersion}
        onDestroy={this.handleModalDestroy} />
    );
  },

  updateFilters: function (filters) {
    var router = this.context.router;
    var params = router.getCurrentParams();
    var query = router.getCurrentQuery();

    if (params != null && filters.filterText !== "") {
      this.context.router.transitionTo("apps", params, query);
    }

    AppsFiltersActions.setFilters(filters);
  },

  toggleHelpMenu: function () {
    this.setState({
      helpMenuVisible: !this.state.helpMenuVisible
    });
  },

  render: function () {
    var state = this.state;
    var router = this.context.router;
    var helpMenuClassName = classNames("help-menu icon help", {
      "active": this.state.helpMenuVisible
    });

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
            <NavTabsComponent activeTabId={state.activeTabId}
              className="navbar-nav nav-tabs-unbordered"
              tabs={tabs} />
            <div className="nav navbar-nav navbar-right">
              <AppListFilterComponent onChange={this.updateFilters} />
              <div className={helpMenuClassName}
                  onClick={this.toggleHelpMenu}
                >
                <span className="caret"></span>
              </div>
              <PopoverComponent visible={this.state.helpMenuVisible}
              className="help-menu-context dropdown">
                <ul className="dropdown-menu">
                  <li>
                    <Link to={router.getCurrentPathname()}
                    query={{modal: "about"}}>
                      About
                    </Link>
                  </li>
                  <li>
                    <a href="../help" target="_blank">
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
              </PopoverComponent>

            </div>

          </div>
        </nav>
        <RouteHandler />
        {state.modal}
        <DialogsComponent />
      </div>
    );
  }
});

export default Marathon;
