var oboe = require("oboe");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var AppVersionsEvents = require("../events/AppVersionsEvents");

var AppVersionsActions = {
  requestAppVersions: function (appId) {
    this.request({
      url: config.apiURL + "v2/apps/" + appId + "/versions"
    })
    .start(function (status) {
      this.status = status;
    })
    .done(function (appVersions) {
      if (this.status !== 200) {
        return;
      }
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS,
        data: appVersions,
        appId: appId
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR,
        data: error
      });
    });
  },
  requestAppVersion: function (appId, versionTimestamp) {
    this.request({
      url: config.apiURL + "v2/apps/" + appId + "/versions/" + versionTimestamp
    })
    .start(function (status) {
      this.status = status;
    })
    .done(function (appVersion) {
      if (this.status !== 200) {
        return;
      }
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_ONE,
        data: appVersion,
        appId: appId,
        versionTimestamp: versionTimestamp
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppVersionsEvents.REQUEST_ONE_ERROR,
        data: error
      });
    });
  },
  request: oboe
};

module.exports = AppVersionsActions;
