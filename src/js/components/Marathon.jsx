import React from "react/addons";
import {RouteHandler} from "react-router";
import Mousetrap from "mousetrap";
import "mousetrap/plugins/global-bind/mousetrap-global-bind";

import config from "../config/config";

import AppListFilterComponent from "../components/AppListFilterComponent";
import AboutModalComponent from "../components/modals/AboutModalComponent";
import AppModalComponent from "../components/modals/AppModalComponent";
import DialogsComponent from "../components/DialogsComponent";
import EditAppModalComponent from "../components/modals/EditAppModalComponent";
import GroupModalComponent from "../components/modals/GroupModalComponent";
import HelpModalComponent from "../components/modals/HelpModalComponent";
import NavTabsComponent from "../components/NavTabsComponent";
import HelpMenuComponent from "./HelpMenuComponent";
import PluginMountPointComponent from "../components/PluginMountPointComponent";

import AppsActions from "../actions/AppsActions";
import DeploymentActions from "../actions/DeploymentActions";
import DialogActions from "../actions/DialogActions";
import QueueActions from "../actions/QueueActions";
import PluginActions from "../actions/PluginActions";

import "../plugin/PluginInterface";
import PluginStore from "../stores/PluginStore";
import PluginEvents from "../events/PluginEvents";
import PluginMountPoints from "../plugin/shared/PluginMountPoints";

import NavTabStore from "../stores/NavTabStore";

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
    PluginActions.requestPlugins();

    this.onRouteChange();
    this.bindKeyboardShortcuts();

    PluginStore.on(PluginEvents.CHANGE, this.onPluginStoreChange);
  },

  componentWillReceiveProps: function () {
    this.onRouteChange();
  },

  onPluginStoreChange: function () {
    if (PluginStore.isPluginsLoadingFinished) {
      this.startPolling();
    }
  },

  onRouteChange: function () {
    var router = this.context.router;

    var params = router.getCurrentParams();
    var path = router.getCurrentPathname();
    var query = router.getCurrentQuery();
    var modalQuery = query.modal;
    var modal = null;

    if (modalQuery === "new-app") {
      let groupId = params.groupId != null
        ? `${decodeURIComponent(params.groupId)}/`
        : null;
      modal = this.getNewAppModal(groupId);
    } else if (modalQuery === "about") {
      modal = this.getAboutModal();
    } else if (modalQuery === "help") {
      modal = this.getHelpModal();
    } else if (modalQuery != null && modalQuery.indexOf("edit-app--") > -1) {
      let [, appId, appVersion] = modalQuery.split("--");
      modal = this.getEditAppModal(decodeURIComponent(appId), appVersion);
    } else if (modalQuery === "new-group") {
      let groupId = params.groupId != null
        ? decodeURIComponent(params.groupId)
        : null;
      modal = this.getNewGroupModal(groupId);
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
      ? NavTabStore.getTabs()[0].id
      : null;

    if (NavTabStore.getTabs().find(function (tab) {
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
    /* eslint-disable eqeqeq */
    if ((prevState.activeAppId != this.state.activeAppId ||
        prevState.activeTabId != this.state.activeTabId) &&
      PluginStore.isPluginsLoadingFinished) {
      this.resetPolling();
    }
    /* eslint-enable eqeqeq */
  },

  componentWillUnmount: function () {
    PluginStore.removeListener(PluginEvents.CHANGE, this.onPluginStoreChange);

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
      if (this.state.modal != null) {
        return null;
      }
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "new-app"});
    }.bind(this), "keypress");

    Mousetrap.bind("shift+c", function () {
      if (this.state.modal != null) {
        return null;
      }
      router.transitionTo(router.getCurrentPathname(),
        {}, {modal: "new-group"});
    }.bind(this), "keypress");

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
      if (this.state.modal != null) {
        return null;
      }
      DialogActions.alert({message:`You're running version ${config.version}.`,
        title: "Marathon UI"});
    }.bind(this));

    Mousetrap.bind("shift+,", function () {
      if (this.state.modal != null) {
        return null;
      }
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "about"});
    }.bind(this));

    Mousetrap.bind("?", function () {
      if (this.state.modal != null) {
        return null;
      }
      router.transitionTo(router.getCurrentPathname(), {}, {modal: "help"});
    }.bind(this));
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
    } else {
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

  getNewGroupModal: function (groupId) {
    return (
      <GroupModalComponent parentGroupId={groupId}
        onDestroy={this.handleModalDestroy} />
    );
  },

  render: function () {
    var state = this.state;

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
              tabs={NavTabStore.getTabs()} />
            <div className="nav navbar-nav navbar-right">
              <AppListFilterComponent />
              <HelpMenuComponent />
              <PluginMountPointComponent
                placeId={PluginMountPoints.NAVBAR_TOP_RIGHT} />
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
