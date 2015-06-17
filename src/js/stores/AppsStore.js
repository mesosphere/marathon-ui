var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");

var AppsStore = lazy(EventEmitter.prototype).extend({
  // Array of apps objects recieved from the "apps/"-endpoint
  apps: [],
  // Object of the current app recieved from the "apps/[appid]"-endpoint
  currentApp: {}
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppsEvents.REQUEST_APPS:
      AppsStore.apps = action.data;
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APPS_ERROR:
      AppsStore.emit(AppsEvents.REQUEST_APPS_ERROR);
      break;
    case AppsEvents.REQUEST_APP:
      AppsStore.currentApp = action.data;
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APP_ERROR:
      AppsStore.emit(AppsEvents.REQUEST_APP_ERROR);
      break;
  }
});

module.exports = AppsStore;
