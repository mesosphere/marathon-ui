var EventEmitter = require("events").EventEmitter;

var AppDispatcher = require("../AppDispatcher");
var GroupsEvents = require("../events/GroupsEvents");

var Util = require("../helpers/Util");

var GroupsStore = Util.extendObject(EventEmitter.prototype, {});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case GroupsEvents.SCALE_SUCCESS:
      GroupsStore.emit(GroupsEvents.SCALE_SUCCESS);
      break;
    case GroupsEvents.SCALE_ERROR:
      GroupsStore.emit(
        GroupsEvents.SCALE_ERROR,
        action.data.body
      );
      break;
    case GroupsEvents.DELETE_SUCCESS:
      GroupsStore.emit(
        GroupsEvents.DELETE_SUCCESS
      );
      break;
    case GroupsEvents.DELETE_ERROR:
      GroupsStore.emit(
        GroupsEvents.DELETE_ERROR,
        action.data.body
      );
      break;
  }
});

module.exports = GroupsStore;
