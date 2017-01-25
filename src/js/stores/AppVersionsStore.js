import {EventEmitter} from "events";

import {AllAppConfigDefaultValues} from "../constants/AppConfigDefaults";
import AppConfigTransforms from "./transforms/AppConfigTransforms";
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
      return this.availableAppVersions
        .sort(function (a, b) {
          if (a < b) {
            return 1;
          }
          if (a > b) {
            return -1;
          }
          return 0;
        });
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
      if (AllAppConfigDefaultValues.hasOwnProperty(key)) {
        let defaultVal = AllAppConfigDefaultValues[key];
        let val = version[key];
        if (!Util.isEgal(val, defaultVal)) {
          memo[key] = val;
        }
      }
      return memo;
    }, {});
  },

  // Diff the new configuration against the current app settings
  getAppConfigDiff: function (appId, newConfig) {
    var allVersions = this.getAppVersions(appId);
    if (allVersions.length === 0) {
      return newConfig;
    }
    var latestVersion = allVersions[0];
    return AppConfigTransforms.diff(this.appVersions[latestVersion], newConfig);
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
