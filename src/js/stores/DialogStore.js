var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");

function addDialog(dialogs, message, dialogId) {
  dialogs.push({id: dialogId, message: message});
}

function removeDialog(dialogs, dialogId) {
  dialogs = dialogs.filter(function (dialog) {
    return dialog.id !== dialogId;
  });
}

var DialogStore = lazy(EventEmitter.prototype).extend({
  dialogs: [],
  handleConfirm: function (dialogId, acceptCallback, dismissCallback) {
    dismissCallback = dismissCallback || function () {};

    function onAccept(id) {
      if (dialogId === id) {
        acceptCallback();
        removeListeners();
      }
    }

    function onDismiss(id) {
      if (dialogId === id) {
        dismissCallback();
        removeListeners();
      }
    }

    function removeListeners() {
      DialogStore.removeListener(DialogEvents.CONFIRM_ACCEPT, onAccept);
      DialogStore.removeListener(DialogEvents.CONFIRM_CLOSE, onDismiss);
    }

    DialogStore.on(DialogEvents.CONFIRM_ACCEPT, onAccept);
    DialogStore.on(DialogEvents.CONFIRM_CLOSE, onDismiss);
  }
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case DialogEvents.ALERT:
      addDialog(DialogStore.dialogs, action.message, action.dialogId);
      DialogStore.emit(
        DialogEvents.ALERT,
        action.message,
        action.dialogId
      );
      break;
    case DialogEvents.ALERT_CLOSE:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.ALERT_CLOSE, action.dialogId);
      break;
    case DialogEvents.CONFIRM:
      addDialog(DialogStore.dialogs, action.message, action.dialogId);
      DialogStore.emit(
        DialogEvents.CONFIRM,
        action.message,
        action.dialogId
      );
      break;
    case DialogEvents.CONFIRM_CLOSE:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.CONFIRM_CLOSE, action.dialogId);
      break;
    case DialogEvents.CONFIRM_ACCEPT:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.CONFIRM_ACCEPT, action.dialogId);
      break;
  }
});

module.exports = DialogStore;
