var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppVersionsEvents = require("../events/AppVersionsEvents");

var AppVersionsStore = lazy(EventEmitter.prototype).extend({
  // appId where the app versions belong to
  currentAppId: null,
  // List of the available version timestamps
  availableAppVersions: [],
  // Already requested versions with version timestamp as key
  appVersions: {},

  resetOnAppChange: function (appId) {
    if (appId !== this.currentAppId) {
      this.availableAppVersions = [];
      this.appVersions = {};
      this.currentAppId = appId;
    }
  }
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppVersionsEvents.REQUEST_APP_VERSIONS:
      AppVersionsStore.resetOnAppChange(action.appId);
      AppVersionsStore.availableAppVersions = action.data;
      AppVersionsStore.emit(AppVersionsEvents.CHANGE);
      break;
    case AppVersionsEvents.REQUEST_APP_VERSIONS_ERROR:
      AppVersionsStore.emit(AppVersionsEvents.REQUEST_APP_VERSIONS_ERROR,
        action.data.jsonBody);
      break;
    case AppVersionsEvents.REQUEST_APP_VERSION:
      AppVersionsStore.resetOnAppChange(action.appId);
      AppVersionsStore.appVersions[action.versionTimestamp] = action.data;
      AppVersionsStore.emit(AppVersionsEvents.CHANGE);
      break;
    case AppVersionsEvents.REQUEST_APP_VERSION_ERROR:
      AppVersionsStore.emit(
        AppVersionsEvents.REQUEST_APP_VERSION_ERROR,
        action.data.jsonBody
      );
      break;
  }
});

module.exports = AppVersionsStore;
