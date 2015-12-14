var ajaxWrapper = require("../helpers/ajaxWrapper");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");

var AppsActions = {
  requestApps: function () {
    this.request({
      url: `${config.apiURL}v2/apps`
    })
      .success(function (apps) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.REQUEST_APPS,
          data: apps
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.REQUEST_APPS_ERROR,
          data: error
        });
      });
  },
  requestApp: function (appId) {
    this.request({
      url: `${config.apiURL}v2/apps/${appId}?embed=app.taskStats`
    })
      .success(function (app) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.REQUEST_APP,
          data: app
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.REQUEST_APP_ERROR,
          data: error
        });
      });
  },
  createApp: function (newAppAttributes) {
    this.request({
      method: "POST",
      data: newAppAttributes,
      url: `${config.apiURL}v2/apps`
    })
      .success(function (app) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.CREATE_APP,
          data: app
        });
      })
      .error(function (error) {
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
      url: `${config.apiURL}v2/apps/${appId}`
    })
      .success(function (app) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.DELETE_APP,
          data: app,
          appId: appId
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.DELETE_APP_ERROR,
          data: error
        });
      });
  },
  restartApp: function (appId) {
    this.request({
      method: "POST",
      data: {
        force: false
      },
      url: `${config.apiURL}v2/apps/${appId}/restart`
    })
      .success(function (app) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.RESTART_APP,
          data: app,
          appId: appId
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.RESTART_APP_ERROR,
          data: error
        });
      });
  },
  scaleApp: function (appId, instances, force = false) {
    var url = `${config.apiURL}v2/apps/${appId}`;
    if (force) {
      url = url + "?force=true";
    }
    this.request({
      method: "PUT",
      data: {
        instances: instances
      },
      headers: {
        "Content-Type": "application/json"
      },
      url: url
    })
      .success(function (app) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.SCALE_APP,
          data: app,
          appId: appId
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.SCALE_APP_ERROR,
          data: error,
          instances: instances
        });
      });
  },
  applySettingsOnApp: function (appId, settings, isEditing = false,
      force = false) {
    // Version key is not allowed and not needed on settings object
    var clonedSettings = Object.assign({}, settings);
    delete clonedSettings.version;

    // Used to mark current app config as stale
    AppDispatcher.dispatch({
      actionType: AppsEvents.APPLY_APP_REQUEST,
      appId: appId
    });

    var url = `${config.apiURL}v2/apps/${appId}`;
    if (force) {
      url = url + "?force=true";
    }

    this.request({
      method: "PUT",
      data: clonedSettings,
      url: url
    })
      .success(function (app) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.APPLY_APP,
          data: app,
          appId: appId,
          isEditing: isEditing
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: AppsEvents.APPLY_APP_ERROR,
          data: error,
          isEditing: isEditing
        });
      });
  },
  emitFilterCounts: function (filterCounts) {
    AppDispatcher.dispatchNext({
      actionType: AppsEvents.UPDATE_APPS_FILTER_COUNT,
      data: filterCounts
    });
  },
  request: ajaxWrapper
};

module.exports = AppsActions;
