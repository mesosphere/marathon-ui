import {EventEmitter} from "events";

import {AppConfigDefaultValues} from "../constants/AppConfigDefaults";
import AppDispatcher from "../AppDispatcher";
import appScheme from "../stores/schemes/appScheme";
import AppVersionsEvents from "../events/AppVersionsEvents";

import Util from "../helpers/Util";

const storeData = {
  appVersions: {},
  availableAppVersions: [],
  currentAppId: null
};

function processAppVersion(appVersion) {
  return Util.extendObject(appScheme, appVersion);
}

var AppVersionsStore = Util.extendObject(EventEmitter.prototype, {
  // Already requested versions with version timestamp as key
  get appVersions() {
    return Util.deepCopy(storeData.appVersions);
  },
  // List of the available version timestamps
  get availableAppVersions() {
    return Util.deepCopy(storeData.availableAppVersions);
  },
  // appId where the app versions belong to
  get currentAppId() {
    return storeData.currentAppId;
  },

  resetOnAppChange: function (appId) {
    if (appId !== storeData.currentAppId) {
      storeData.availableAppVersions = [];
      storeData.appVersions = {};
      storeData.currentAppId = appId;
    }
  },

  getAppVersions: function (appId) {
    if (appId === storeData.currentAppId) {
      return this.availableAppVersions;
    }
    return [];
  },

  getAppVersion: function (appId, appVersionTimestamp) {
    if (appId === storeData.currentAppId) {
      return Util.deepCopy(this.appVersions[appVersionTimestamp]) || {};
    }
    return {};
  },

  // every significant field in the full definition returned from the
  // versions endpoint
  getAppConfigVersion: function (appId, appVersionTimestamp) {
    var version = this.getAppVersion(appId, appVersionTimestamp);
    return Object.keys(version).reduce((memo, key) => {
      if (AppConfigDefaultValues.hasOwnProperty(key)) {
        let defaultVal = AppConfigDefaultValues[key];
        let val = version[key];
        if (val !== defaultVal) {
          memo[key] = val;
        }
      }
      return memo;
    }, {});
  }
});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS:
      AppVersionsStore.resetOnAppChange(action.appId);
      storeData.availableAppVersions = action.data.body.versions;
      AppVersionsStore.emit(AppVersionsEvents.CHANGE, action.appId);
      break;
    case AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR:
      AppVersionsStore.emit(
        AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR,
        action.data.body,
        action.appId
      );
      break;
    case AppVersionsEvents.REQUEST_ONE:
      AppVersionsStore.resetOnAppChange(action.appId);
      storeData.appVersions[action.versionTimestamp] =
        processAppVersion(action.data.body);
      AppVersionsStore.emit(AppVersionsEvents.CHANGE, action.versionTimestamp);
      break;
    case AppVersionsEvents.REQUEST_ONE_ERROR:
      AppVersionsStore.emit(
        AppVersionsEvents.REQUEST_ONE_ERROR,
        action.data.body,
        action.versionTimestamp
      );
      break;
  }
});

export default AppVersionsStore;
