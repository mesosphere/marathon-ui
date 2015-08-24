var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");

var DialogStore = lazy(EventEmitter.prototype).extend({
  dialogs: []
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case DialogEvents.ALERT:
      const dialogId = Symbol(action.message);
      DialogStore.dialogs.push(dialogId);
      DialogStore.emit(DialogEvents.ALERT, action.message, dialogId);
      break;
    case DialogEvents.ALERT_CLOSE:
      DialogStore.dialogs = DialogStore.dialogs.filter(function (dialog) {
        return dialog !== action.dialogId;
      });
      DialogStore.emit(DialogEvents.ALERT_CLOSE, action.dialogId);
      break;
  }
});

module.exports = DialogStore;
