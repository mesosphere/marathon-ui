var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var InfoEvents = require("../events/InfoEvents");

var InfoStore = lazy(EventEmitter.prototype).extend({
  info: {}
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case InfoEvents.REQUEST:
      InfoStore.info = action.data;
      InfoStore.emit(InfoEvents.CHANGE);
      break;
    case InfoEvents.REQUEST_ERROR:
      InfoStore.emit(InfoEvents.REQUEST_ERROR,
        action.data.jsonBody);
      break;
  }
});

module.exports = InfoStore;
