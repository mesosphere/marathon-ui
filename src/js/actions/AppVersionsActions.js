var oboeWrapper = require("../helpers/oboeWrapper");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var AppVersionsEvents = require("../events/AppVersionsEvents");

var AppVersionsActions = {
  requestAppVersions: function (appId) {
    this.request({
      url: config.apiURL + "v2/apps/" + appId + "/versions"
    })
    .success(function (appVersions) {
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS,
        data: appVersions,
        appId: appId
      });
    })
    .error(function (error) {
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR,
        data: error,
        appId: appId
      });
    });
  },
  requestAppVersion: function (appId, versionTimestamp) {
    this.request({
      url: config.apiURL + "v2/apps/" + appId + "/versions/" + versionTimestamp
    })
    .success(function (appVersion) {
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_ONE,
        data: appVersion,
        appId: appId,
        versionTimestamp: versionTimestamp
      });
    })
    .error(function (error) {
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_ONE_ERROR,
        data: error,
        appId: appId,
        versionTimestamp: versionTimestamp
      });
    });
  },
  request: oboeWrapper
};

module.exports = AppVersionsActions;
