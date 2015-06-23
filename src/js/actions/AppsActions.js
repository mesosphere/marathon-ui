var OboeWrapper = require("../helpers/OboeWrapper");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");

var AppsActions = {
  requestApps: function () {
    this.request({
      url: config.apiURL + "v2/apps"
    })
    .success(function (apps) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.REQUEST_APPS,
        data: apps
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.REQUEST_APPS_ERROR,
        data: error
      });
    });
  },
  requestApp: function (appId) {
    this.request({
      url: config.apiURL + "v2/apps/" + appId
    })
    .success(function (app) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.REQUEST_APP,
        data: app
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.REQUEST_APP_ERROR,
        data: error
      });
    });
  },
  createApp: function (newAppAttributes) {
    this.request({
      method: "POST",
      body: newAppAttributes,
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps"
    })
    .success(function (app) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.CREATE_APP,
        data: app
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.CREATE_APP_ERROR,
        data: error
      });
    });
  },
  deleteApp: function (appId) {
    this.request({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps/" + appId
    })
    .success(function (app) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.DELETE_APP,
        data: app,
        appId: appId
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.DELETE_APP_ERROR,
        data: error
      });
    });
  },
  restartApp: function (appId) {
    this.request({
      method: "POST",
      body: {
        force: false
      },
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps/" + appId + "/restart"
    })
    .success(function (app) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.RESTART_APP,
        data: app,
        appId: appId
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.RESTART_APP_ERROR,
        data: error
      });
    });
  },
  scaleApp: function (appId, instances) {
    this.request({
      method: "PUT",
      body: {
        instances: instances
      },
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps/" + appId
    })
    .success(function (app) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.SCALE_APP,
        data: app,
        appId: appId
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.SCALE_APP_ERROR,
        data: error
      });
    });
  },
  applySettingsOnApp: function (appId, settings) {
    this.request({
      method: "PUT",
      body: settings,
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps/" + appId
    })
    .success(function (app) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.APPLY_APP,
        data: app,
        appId: appId
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.APPLY_APP_ERROR,
        data: error
      });
    });
  },
  request: OboeWrapper
};

module.exports = AppsActions;
