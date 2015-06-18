var oboe = require("oboe");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");

var AppsActions = {
  requestApps: function () {
    this.request({
      url: config.apiURL + "v2/apps"
    })
    .start(function (status) {
      this.status = status;
    })
    .done(function (apps) {
      if (this.status !== 200) {
        return;
      }
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
    .start(function (status) {
      this.status = status;
    })
    .done(function (app) {
      if (this.status !== 200) {
        return;
      }
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
  deleteApp: function (appId) {
    this.request({
      method: "DELETE",
      url: config.apiURL + "v2/apps/" + appId
    })
    .start(function (status) {
      this.status = status;
    })
    .done(function (app) {
      if (this.status !== 200) {
        return;
      }
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
  request: oboe
};

module.exports = AppsActions;
