var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");

var AppsStore = lazy(EventEmitter.prototype).extend({
  apps: []
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
  }
});

module.exports = AppsStore;
